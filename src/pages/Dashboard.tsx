import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { getExpensesByUserId, getAllExpenses, getAllUsers } from '@/lib/api-client';
import { ExpenseRequest } from '@/types';
import { CreditCard, FileText, Clock, CheckCircle, UserCheck } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

const Dashboard = () => {
  const user = getCurrentUser();
  const [allExpenses, setAllExpenses] = useState<ExpenseRequest[]>([]);
  const [userExpenses, setUserExpenses] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load expenses based on user role
  React.useEffect(() => {
    const loadExpenses = async () => {
      console.log('Dashboard - Loading expenses for user:', user);
      
      if (!user?.id) {
        console.log('Dashboard - No user ID, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        if (user.role === 'admin') {
          // Admin sees all expenses
          console.log('Dashboard - Admin: Fetching all expenses');
          const allExpensesData = await getAllExpenses();
          console.log('Dashboard - Admin: Received all expenses:', allExpensesData);
          setAllExpenses(allExpensesData);
          setUserExpenses(allExpensesData);
        } else if (user.role === 'manager') {
          // Manager sees all expenses (can approve any)
          console.log('Dashboard - Manager: Fetching all expenses');
          const allExpensesData = await getAllExpenses();
          console.log('Dashboard - Manager: Received all expenses:', allExpensesData);
          setAllExpenses(allExpensesData);
          setUserExpenses(allExpensesData);
        } else {
          // Employee sees only their own expenses
          console.log('Dashboard - Employee: Fetching user expenses for ID:', user.id);
          const userExpensesData = await getExpensesByUserId(user.id);
          console.log('Dashboard - Employee: Received user expenses:', userExpensesData);
          setUserExpenses(userExpensesData);
        }
      } catch (error) {
        console.error('Dashboard - Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [user?.id, user?.role]);

  // Calculate stats based on user role
  const getDashboardStats = () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      // For admins/managers: show expenses they can approve
      const pendingExpenses = allExpenses.filter(e => e.status === 'pending');
      const approvedExpenses = allExpenses.filter(e => e.status === 'approved');
      const rejectedExpenses = allExpenses.filter(e => e.status === 'rejected');
      const totalAmount = allExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
      
      // Find expenses approved by this user
      const approvedByUser = allExpenses.filter(expense => 
        expense.approvalActions?.some(action => 
          action.userId === user.id && action.actionType === 'approved'
        )
      );
      const totalApprovedAmount = approvedByUser.reduce((sum, e) => sum + e.totalAmount, 0);
      
      return {
        totalExpenses: allExpenses.length,
        pendingExpenses: pendingExpenses.length,
        approvedExpenses: approvedExpenses.length,
        rejectedExpenses: rejectedExpenses.length,
        totalAmount,
        approvedByUser: approvedByUser.length,
        totalApprovedAmount
      };
    } else {
      // For employees: show their own expenses
      const pendingExpenses = userExpenses.filter(e => e.status === 'pending');
      const approvedExpenses = userExpenses.filter(e => e.status === 'approved');
      const totalAmount = userExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
      
      return {
        totalExpenses: userExpenses.length,
        pendingExpenses: pendingExpenses.length,
        approvedExpenses: approvedExpenses.length,
        rejectedExpenses: 0,
        totalAmount,
        approvedByUser: 0,
        totalApprovedAmount: 0
      };
    }
  };

  const stats = getDashboardStats();
  
  console.log('Dashboard - Stats:', {
    userRole: user?.role,
    userExpenses: userExpenses.length,
    allExpenses: allExpenses.length,
    stats
  });
  
  // Get user's currency
  const userCurrency = user?.currency || 'USD';
  const currencySymbol = userCurrency === 'INR' ? '₹' : userCurrency === 'USD' ? '$' : userCurrency;

  const getStatsCards = () => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      return [
        {
          title: 'Total Expenses',
          value: stats.totalExpenses,
          icon: FileText,
          description: 'All expenses in system',
        },
        {
          title: 'Pending Approval',
          value: stats.pendingExpenses,
          icon: Clock,
          description: 'Awaiting your review',
        },
        {
          title: 'Approved by You',
          value: stats.approvedByUser,
          icon: UserCheck,
          description: 'Expenses you approved',
        },
        {
          title: 'Total Approved Amount',
          value: `${currencySymbol}${stats.totalApprovedAmount.toFixed(2)}`,
          icon: CreditCard,
          description: 'Amount you approved',
        },
      ];
    } else {
      return [
        {
          title: 'My Expenses',
          value: stats.totalExpenses,
          icon: FileText,
          description: 'All time',
        },
        {
          title: 'Pending Approval',
          value: stats.pendingExpenses,
          icon: Clock,
          description: 'Awaiting review',
        },
        {
          title: 'Approved',
          value: stats.approvedExpenses,
          icon: CheckCircle,
          description: 'This month',
        },
        {
          title: 'Total Amount',
          value: `${currencySymbol}${stats.totalAmount.toFixed(2)}`,
          icon: CreditCard,
          description: userCurrency,
        },
      ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Here's an overview of your expense activity and financial summary
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">
              {user?.role === 'admin' || user?.role === 'manager' ? 'Recent Approvals' : 'Recent Expenses'}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {user?.role === 'admin' || user?.role === 'manager' 
                ? 'Your latest approval actions' 
                : 'Your latest expense submissions'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Loading expenses...
              </p>
            ) : (() => {
              if (user?.role === 'admin' || user?.role === 'manager') {
                // Show expenses approved by this user
                const approvedByUser = allExpenses.filter(expense => 
                  expense.approvalActions?.some(action => 
                    action.userId === user.id && action.actionType === 'approved'
                  )
                ).sort((a, b) => new Date(b.submitDate).getTime() - new Date(a.submitDate).getTime());
                
                if (approvedByUser.length === 0) {
                  return (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      No approvals made yet
                    </p>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {approvedByUser.slice(0, 5).map((expense) => {
                      const approvalAction = expense.approvalActions?.find(action => 
                        action.userId === user.id && action.actionType === 'approved'
                      );
                      return (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Approved on {approvalAction ? new Date(approvalAction.actionDate).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {expense.currency === 'INR' ? '₹' : expense.currency === 'USD' ? '$' : expense.currency}{expense.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Approved
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                // Show user's own expenses
                if (userExpenses.length === 0) {
                  return (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                      No expenses submitted yet
                    </p>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {userExpenses.slice(0, 5).map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.description}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(expense.submitDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {expense.currency === 'INR' ? '₹' : expense.currency === 'USD' ? '$' : expense.currency}{expense.totalAmount.toFixed(2)}
                          </p>
                          <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
                            {expense.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
