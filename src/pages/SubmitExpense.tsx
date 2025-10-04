import { useState } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { expenseCategories } from '@/lib/mockData';
import { getAllUsers, createExpense } from '@/lib/api-client';
import { simulateOCR, performOCR } from '@/lib/api';
import { fetchCountries, getCurrencySymbol } from '@/lib/country-api';
import { convertCurrency, formatCurrency } from '@/lib/currency-converter';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Plus, Upload, X, Sparkles, Loader2 } from 'lucide-react';
import { User } from '@/types';

interface ExpenseItem {
  amount: string;
  date: string;
  description: string;
  category: string;
  currency: string;
  convertedAmount?: number;
  originalAmount?: number;
  originalCurrency?: string;
}

const SubmitExpense = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const authUser = getCurrentUser();
  
  // Load current user and currencies on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [users, countries] = await Promise.all([
          getAllUsers(),
          fetchCountries()
        ]);
        
        // Use the authenticated user instead of finding a random employee
        const authenticatedUser = authUser || users.find(u => u.role === 'employee') || users[0];
        setCurrentUser(authenticatedUser);
        
        // Extract unique currencies from countries
        const currencies = [...new Set(countries.map(c => c.currency))].sort();
        setAvailableCurrencies(currencies);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authUser]);

  const defaultCurrency = currentUser?.currency || 'USD';
  
  const [items, setItems] = useState<ExpenseItem[]>([
    { amount: '', date: '', description: '', category: '', currency: defaultCurrency },
  ]);
  const [overallDescription, setOverallDescription] = useState('');
  const [receipts, setReceipts] = useState<File[]>([]);
  const [processingOCR, setProcessingOCR] = useState(false);

  // Check permissions after loading
  if (!loading && !hasPermission(currentUser, PERMISSIONS.SUBMIT_EXPENSES)) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              You do not have permission to submit expenses. Only employees and managers can submit expenses.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const addItem = () => {
    setItems([...items, { amount: '', date: '', description: '', category: '', currency: defaultCurrency }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReceipts([...receipts, ...Array.from(e.target.files)]);
    }
  };

  const removeReceipt = (index: number) => {
    setReceipts(receipts.filter((_, i) => i !== index));
  };

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessingOCR(true);
    try {
      const ocrResult = await performOCR(file);
      
      // Auto-fill the first empty item or add new item
      const emptyIndex = items.findIndex(item => !item.amount);
      const targetIndex = emptyIndex >= 0 ? emptyIndex : items.length;
      
      const newItems = [...items];
      if (targetIndex >= items.length) {
        newItems.push({ amount: '', date: '', description: '', category: '', currency: defaultCurrency });
      }
      
      const ocrCurrency = ocrResult.currency || defaultCurrency;
      const ocrAmount = ocrResult.amount || 0;
      
      // Convert currency if different from user's default
      let convertedAmount = ocrAmount;
      const originalAmount = ocrAmount;
      const originalCurrency = ocrCurrency;
      
      if (ocrCurrency !== defaultCurrency) {
        try {
          convertedAmount = await convertCurrency(ocrAmount, ocrCurrency, defaultCurrency);
        } catch (error) {
          console.error('Currency conversion failed:', error);
          // Keep original amount if conversion fails
        }
      }
      
      newItems[targetIndex] = {
        amount: convertedAmount.toString(),
        date: ocrResult.date || '',
        description: ocrResult.description || '',
        category: ocrResult.category || '',
        currency: defaultCurrency,
        convertedAmount,
        originalAmount,
        originalCurrency,
      };
      
      setItems(newItems);
      setReceipts([...receipts, file]);
      
      const conversionMessage = ocrCurrency !== defaultCurrency 
        ? ` (converted from ${formatCurrency(originalAmount, originalCurrency)})`
        : '';
      
      toast({
        title: 'Receipt processed!',
        description: `Expense details extracted and filled automatically${conversionMessage}`,
      });
    } catch (error) {
      toast({
        title: 'OCR failed',
        description: 'Could not extract data from receipt',
        variant: 'destructive',
      });
    } finally {
      setProcessingOCR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'User not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      const expenseData = {
        userId: currentUser.id,
        description: overallDescription,
        items: items.map(item => ({
          amount: parseFloat(item.amount) || 0,
          date: item.date,
          description: item.description,
          category: item.category,
          currency: item.currency,
        })),
        receipts: receipts.map(file => ({
          filePath: `/uploads/${file.name}`,
        })),
      };

      const newExpense = await createExpense(expenseData);
      
      if (newExpense) {
        const totalAmount = newExpense.totalAmount;
        const currencySymbol = defaultCurrency === 'INR' ? '₹' : defaultCurrency === 'USD' ? '$' : defaultCurrency;
        
        toast({
          title: 'Expense submitted!',
          description: `Total amount: ${currencySymbol}${totalAmount.toFixed(2)} - Awaiting approval`,
        });

        // Reset form
        setItems([{ amount: '', date: '', description: '', category: '', currency: defaultCurrency }]);
        setOverallDescription('');
        setReceipts([]);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to submit expense',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit expense',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Submit Expense
          </h2>
          <p className="text-muted-foreground">
            Create a new expense report for approval
          </p>
          <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Employee Information</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {loading ? 'Loading...' : `${currentUser?.name} • ${currentUser?.country} • Default Currency: ${defaultCurrency}`}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expense Currency</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  All expenses will be submitted in {defaultCurrency}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>
                Add expense items and upload receipts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Overall Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this expense report"
                  value={overallDescription}
                  onChange={(e) => setOverallDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Expense Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index} className="border border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.amount}
                                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                required
                                className="flex-1"
                              />
                              {item.currency !== defaultCurrency && item.amount && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const amount = parseFloat(item.amount);
                                      if (amount && item.currency) {
                                        const converted = await convertCurrency(amount, item.currency, defaultCurrency);
                                        updateItem(index, 'amount', converted.toString());
                                        updateItem(index, 'currency', defaultCurrency);
                                        toast({
                                          title: 'Currency converted',
                                          description: `${formatCurrency(amount, item.currency)} converted to ${formatCurrency(converted, defaultCurrency)}`,
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: 'Conversion failed',
                                        description: 'Could not convert currency',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                >
                                  Convert to {defaultCurrency}
                                </Button>
                              )}
                            </div>
                            {item.originalAmount && item.originalCurrency && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Original: {formatCurrency(item.originalAmount, item.originalCurrency)}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select
                              value={item.currency}
                              onValueChange={(value) => updateItem(index, 'currency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCurrencies.map((curr) => (
                                  <SelectItem key={curr} value={curr}>
                                    {getCurrencySymbol(curr)} {curr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={item.date}
                              onChange={(e) => updateItem(index, 'date', e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={item.category}
                              onValueChange={(value) => updateItem(index, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {expenseCategories.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 sm:col-span-2">
                            <Label>Description</Label>
                            <Input
                              placeholder="Item description"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <Label>Receipts</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <Button type="button" variant="outline" asChild>
                    <label className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Receipt
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        multiple
                      />
                    </label>
                  </Button>
                  
                  <Button type="button" variant="secondary" asChild disabled={processingOCR}>
                    <label className="cursor-pointer">
                      {processingOCR ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {processingOCR ? 'Processing...' : 'OCR Extract'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleOCRUpload}
                        disabled={processingOCR}
                      />
                    </label>
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    {receipts.length} file(s) uploaded
                  </p>
                </div>

                {receipts.length > 0 && (
                  <div className="space-y-2">
                    {receipts.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <p className="text-sm">{file.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeReceipt(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" className="px-8">
              Save as Draft
            </Button>
            <Button type="submit" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">
              Submit for Approval
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SubmitExpense;
