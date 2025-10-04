import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/StatusBadge';
import { ConvertedAmount } from '@/components/ConvertedAmount';
import { getAllExpenses, updateExpenseStatus, getAllUsers, getCompany } from '@/lib/api-client';
import { ExpenseRequest, User } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { convertCurrency, formatCurrency } from '@/lib/currency-converter';
import { toast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';
import React from 'react';

const Approvals = () => {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [allExpenses, setAllExpenses] = useState<ExpenseRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [companyCurrency, setCompanyCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  // Load all expenses, users, and company data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [expenses, users, company] = await Promise.all([
          getAllExpenses(),
          getAllUsers(),
          getCompany()
        ]);
        setAllExpenses(expenses);
        setAllUsers(users);
        if (company) {
          setCompanyCurrency(company.currency);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter expenses based on current user's role
  const getPendingExpenses = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'admin') {
      // Admin can see all pending expenses
      return allExpenses.filter(e => e.status === 'pending');
    } else if (currentUser.role === 'manager') {
      // Manager can only see expenses from their direct reports
      const directReports = allUsers.filter(u => u.managerId === currentUser.id);
      const directReportIds = directReports.map(u => u.id);
      return allExpenses.filter(e => 
        e.status === 'pending' && directReportIds.includes(e.userId)
      );
    } else {
      // Employees can't see approval queue
      return [];
    }
  };

  const pendingExpenses = getPendingExpenses();

  // Convert expense amount to company currency for display
  const getDisplayAmount = async (expense: ExpenseRequest): Promise<string> => {
    if (expense.currency === companyCurrency) {
      return formatCurrency(expense.totalAmount, companyCurrency);
    }
    
    try {
      const convertedAmount = await convertCurrency(
        expense.totalAmount, 
        expense.currency, 
        companyCurrency
      );
      return formatCurrency(convertedAmount, companyCurrency);
    } catch (error) {
      // Fallback to original amount if conversion fails
      return formatCurrency(expense.totalAmount, expense.currency);
    }
  };

  // Check permissions
  if (!hasPermission(currentUser, PERMISSIONS.APPROVE_EXPENSES)) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              You do not have permission to view the approvals page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleApprove = async (expenseId: string) => {
    if (!currentUser) return;
    
    try {
      const success = await updateExpenseStatus(
        expenseId,
        'approved',
        currentUser.id,
        currentUser.name,
        comments
      );

      if (success) {
        // Update local state
        setAllExpenses(prev => 
          prev.map(expense => 
            expense.id === expenseId 
              ? { ...expense, status: 'approved' }
              : expense
          )
        );

        toast({
          title: 'Expense approved',
          description: 'The expense has been approved successfully',
        });
        setSelectedExpense(null);
        setComments('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to approve expense',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve expense',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (expenseId: string) => {
    if (!currentUser) return;
    
    try {
      const success = await updateExpenseStatus(
        expenseId,
        'rejected',
        currentUser.id,
        currentUser.name,
        comments
      );

      if (success) {
        // Update local state
        setAllExpenses(prev => 
          prev.map(expense => 
            expense.id === expenseId 
              ? { ...expense, status: 'rejected' }
              : expense
          )
        );

        toast({
          title: 'Expense rejected',
          description: 'The expense has been rejected',
          variant: 'destructive',
        });
        setSelectedExpense(null);
        setComments('');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reject expense',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject expense',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Pending Approvals
          </h2>
          <p className="text-muted-foreground">
            {currentUser?.role === 'admin' 
              ? 'Review and approve all expense submissions in the system. Amounts shown in company default currency.'
              : currentUser?.role === 'manager'
              ? 'Review and approve expense submissions from your direct reports. Amounts shown in company default currency.'
              : 'You do not have permission to view approvals'
            }
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>
                {pendingExpenses.length} expense(s) awaiting your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">
                  Loading approvals...
                </p>
              ) : pendingExpenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending approvals
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingExpenses.map((expense) => (
                    <button
                      key={expense.id}
                      onClick={() => setSelectedExpense(expense.id)}
                      className={`w-full text-left rounded-lg border p-4 transition-all hover:bg-muted/50 ${
                        selectedExpense === expense.id ? 'border-primary bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-foreground">
                          {expense.description}
                        </p>
                        <StatusBadge status={expense.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Amount: <ConvertedAmount 
                          amount={expense.totalAmount} 
                          fromCurrency={expense.currency} 
                          toCurrency={companyCurrency}
                        />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(expense.submitDate).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>
                Review details and take action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedExpense ? (
                <p className="text-center text-muted-foreground py-8">
                  Select an expense to review
                </p>
              ) : (
                (() => {
                  const expense = pendingExpenses.find(e => e.id === selectedExpense);
                  if (!expense) return null;

                  return (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Items</h3>
                          <div className="space-y-2">
                            {expense.items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border p-3 space-y-1"
                              >
                                <div className="flex justify-between">
                                  <p className="font-medium">{item.description}</p>
                                  <p className="font-semibold">
                                    <ConvertedAmount 
                                      amount={item.amount} 
                                      fromCurrency={item.currency} 
                                      toCurrency={companyCurrency}
                                    />
                                  </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.category} • {new Date(item.date).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-semibold">Total Amount</p>
                            <p className="text-2xl font-bold">{expense.currency === 'INR' ? '₹' : expense.currency === 'USD' ? '$' : expense.currency}{expense.totalAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Textarea
                          id="comments"
                          placeholder="Add comments about this approval..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={() => handleApprove(expense.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReject(expense.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Approvals;
