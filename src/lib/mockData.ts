import { User, ExpenseRequest, Company, ApprovalRule } from '@/types';

export let mockCompany: Company = {
  id: '1',
  name: 'TechCorp Inc.',
  country: 'United States',
  currency: 'USD',
};

export const updateMockCompany = (company: Company) => {
  mockCompany = company;
};

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@techcorp.com',
    name: 'Admin User',
    role: 'admin',
    department: 'Administration',
    hireDate: '2020-01-15',
    country: 'United States',
    currency: 'USD',
  },
  {
    id: '2',
    email: 'manager@techcorp.com',
    name: 'Manager User',
    role: 'manager',
    department: 'Sales',
    hireDate: '2021-03-10',
    country: 'United States',
    currency: 'USD',
  },
  {
    id: '3',
    email: 'employee@techcorp.com',
    name: 'Employee User',
    role: 'employee',
    department: 'Sales',
    managerId: '2',
    hireDate: '2022-06-20',
    country: 'India',
    currency: 'INR',
  },
];

export const mockExpenses: ExpenseRequest[] = [
  {
    id: '1',
    userId: '3',
    submitDate: '2024-01-15',
    totalAmount: 450.00,
    currency: 'INR',
    description: 'Client dinner and transportation',
    status: 'pending',
    items: [
      {
        id: '1',
        amount: 350.00,
        date: '2024-01-14',
        description: 'Business dinner with client',
        category: 'Meals',
        currency: 'INR',
      },
      {
        id: '2',
        amount: 100.00,
        date: '2024-01-14',
        description: 'Taxi to meeting',
        category: 'Transportation',
        currency: 'INR',
      },
    ],
    receipts: [
      {
        id: '1',
        filePath: '/receipts/receipt1.pdf',
        uploadDate: '2024-01-15',
      },
    ],
    approvalActions: [],
  },
  {
    id: '2',
    userId: '3',
    submitDate: '2024-01-10',
    totalAmount: 1200.00,
    currency: 'INR',
    description: 'Conference attendance',
    status: 'approved',
    items: [
      {
        id: '3',
        amount: 800.00,
        date: '2024-01-08',
        description: 'Conference registration',
        category: 'Training',
        currency: 'INR',
      },
      {
        id: '4',
        amount: 400.00,
        date: '2024-01-08',
        description: 'Hotel accommodation',
        category: 'Lodging',
        currency: 'INR',
      },
    ],
    receipts: [
      {
        id: '2',
        filePath: '/receipts/receipt2.pdf',
        uploadDate: '2024-01-10',
      },
    ],
    approvalActions: [
      {
        id: '1',
        userId: '2',
        userName: 'Manager User',
        actionType: 'approved',
        actionDate: '2024-01-11',
        comments: 'Approved for business development',
      },
    ],
  },
  {
    id: '3',
    userId: '3',
    submitDate: '2024-01-05',
    totalAmount: 75.00,
    currency: 'INR',
    description: 'Office supplies',
    status: 'rejected',
    items: [
      {
        id: '5',
        amount: 75.00,
        date: '2024-01-04',
        description: 'Notebooks and pens',
        category: 'Office Supplies',
        currency: 'INR',
      },
    ],
    receipts: [
      {
        id: '3',
        filePath: '/receipts/receipt3.pdf',
        uploadDate: '2024-01-05',
      },
    ],
    approvalActions: [
      {
        id: '2',
        userId: '2',
        userName: 'Manager User',
        actionType: 'rejected',
        actionDate: '2024-01-06',
        comments: 'Should be purchased through company account',
      },
    ],
  },
];

export const expenseCategories = [
  'Meals',
  'Transportation',
  'Lodging',
  'Training',
  'Office Supplies',
  'Software',
  'Equipment',
  'Travel',
  'Other',
];

export const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN',
  'BRL', 'ZAR', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'THB',
];

export const countryCurrencyMap: Record<string, string> = {
  'United States': 'USD',
  'India': 'INR',
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Japan': 'JPY',
  'Australia': 'AUD',
  'Canada': 'CAD',
  'Switzerland': 'CHF',
  'China': 'CNY',
  'Mexico': 'MXN',
  'Brazil': 'BRL',
  'South Africa': 'ZAR',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'New Zealand': 'NZD',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Thailand': 'THB',
};

export const countries = Object.keys(countryCurrencyMap);

export const mockApprovalRules: ApprovalRule[] = [];
