import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';
import { getExpensesByUserId, getAllUsers } from '@/lib/api-client';
import { ExpenseRequest } from '@/types';
import { CreditCard, FileText, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

const Dashboard = () => {
  const user = getCurrentUser();
  const [userExpenses, setUserExpenses] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load user expenses on component mount
  React.useEffect(() => {
    const loadExpenses = async () => {
      console.log('Dashboard - Loading expenses for user:', user);
      
      if (!user?.id) {
        console.log('Dashboard - No user ID, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        console.log('Dashboard - Fetching expenses for user ID:', user.id);
        const expenses = await getExpensesByUserId(user.id);
        console.log('Dashboard - Received expenses:', expenses);
        setUserExpenses(expenses);
      } catch (error) {
        console.error('Dashboard - Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [user?.id]);

  const pendingExpenses = userExpenses.filter(e => e.status === 'pending');
  const approvedExpenses = userExpenses.filter(e => e.status === 'approved');
  const totalAmount = userExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  
  console.log('Dashboard - Stats:', {
    userExpenses: userExpenses.length,
    pendingExpenses: pendingExpenses.length,
    approvedExpenses: approvedExpenses.length,
    totalAmount
  });
  
  // Get user's currency
  const userCurrency = user?.currency || 'USD';
  const currencySymbol = userCurrency === 'INR' ? '₹' : userCurrency === 'USD' ? '$' : userCurrency;

  const stats = [
    {
      title: 'Total Expenses',
      value: userExpenses.length,
      icon: FileText,
      description: 'All time',
    },
    {
      title: 'Pending Approval',
      value: pendingExpenses.length,
      icon: Clock,
      description: 'Awaiting review',
    },
    {
      title: 'Approved',
      value: approvedExpenses.length,
      icon: CheckCircle,
      description: 'This month',
    },
    {
      title: 'Total Amount',
      value: `${currencySymbol}${totalAmount.toFixed(2)}`,
      icon: CreditCard,
      description: userCurrency,
    },
  ];

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
          {stats.map((stat) => {
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
            <CardTitle className="text-slate-900 dark:text-slate-100">Recent Expenses</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Your latest expense submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                Loading expenses...
              </p>
            ) : userExpenses.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No expenses submitted yet
              </p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
