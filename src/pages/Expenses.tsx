import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { getExpensesByUserId } from '@/lib/api-client';
import { ExpenseRequest } from '@/types';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

const Expenses = () => {
  const user = getCurrentUser();
  const [userExpenses, setUserExpenses] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user expenses on component mount
  React.useEffect(() => {
    const loadExpenses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const expenses = await getExpensesByUserId(user.id);
        setUserExpenses(expenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [user?.id]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            My Expenses
          </h2>
          <p className="text-muted-foreground">
            View and track all your expense submissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>
              All your submitted expenses and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                Loading expenses...
              </p>
            ) : userExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No expenses found
              </p>
            ) : (
              <div className="space-y-4">
                {userExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-foreground">
                          {expense.description}
                        </p>
                        <StatusBadge status={expense.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(expense.submitDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expense.items.length} item(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {expense.currency === 'INR' ? '₹' : expense.currency === 'USD' ? '$' : expense.currency}{expense.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{expense.currency}</p>
                      </div>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
