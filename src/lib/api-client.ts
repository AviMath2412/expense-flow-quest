import { User, ExpenseRequest, Company } from '@/types';

// API client that makes HTTP requests to the backend server
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make API requests
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// User operations
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await apiRequest<User[]>('/users');
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (userData: {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  country: string;
  managerId?: string;
  hireDate: string;
}): Promise<User | null> => {
  try {
    return await apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await apiRequest<User>(`/users/${id}`);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (id: string, userData: {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  country: string;
  managerId?: string;
}): Promise<User | null> => {
  try {
    return await apiRequest<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Expense operations
export const getExpensesByUserId = async (userId: string): Promise<ExpenseRequest[]> => {
  try {
    console.log('API Client - Fetching expenses for user ID:', userId);
    const result = await apiRequest<ExpenseRequest[]>(`/expenses/user/${userId}`);
    console.log('API Client - Received expenses:', result);
    return result;
  } catch (error) {
    console.error('API Client - Error fetching expenses:', error);
    return [];
  }
};

export const getAllExpenses = async (): Promise<ExpenseRequest[]> => {
  try {
    return await apiRequest<ExpenseRequest[]>('/expenses');
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    return [];
  }
};

export const createExpense = async (expenseData: {
  userId: string;
  description: string;
  items: Array<{
    amount: number;
    date: string;
    description: string;
    category: string;
    currency: string;
  }>;
  receipts?: Array<{
    filePath: string;
  }>;
}): Promise<ExpenseRequest | null> => {
  try {
    return await apiRequest<ExpenseRequest>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return null;
  }
};

export const updateExpenseStatus = async (
  expenseId: string,
  status: 'approved' | 'rejected',
  approverId: string,
  approverName: string,
  comments?: string
): Promise<boolean> => {
  try {
    await apiRequest(`/expenses/${expenseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        approverId,
        approverName,
        comments,
      }),
    });

    return true;
  } catch (error) {
    console.error('Error updating expense status:', error);
    return false;
  }
};

// Company operations
export const getCompany = async (): Promise<Company | null> => {
  try {
    return await apiRequest<Company>('/company');
  } catch (error) {
    console.error('Error fetching company:', error);
    return null;
  }
};

export const createCompany = async (companyData: {
  name: string;
  country: string;
  currency: string;
}): Promise<Company | null> => {
  try {
    return await apiRequest<Company>('/company', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
};

// Approval rules operations
export const getApprovalRules = async (): Promise<any[]> => {
  try {
    return await apiRequest<any[]>('/approval-rules');
  } catch (error) {
    console.error('Error fetching approval rules:', error);
    return [];
  }
};
