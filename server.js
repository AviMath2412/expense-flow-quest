import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Country currency mapping
const countryCurrencyMap = {
  'United States': 'USD',
  'India': 'INR',
  'United Kingdom': 'GBP',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Germany': 'EUR',
  'France': 'EUR',
  'Japan': 'JPY',
  'China': 'CNY',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'South Korea': 'KRW',
  'Singapore': 'SGD',
  'Netherlands': 'EUR',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'New Zealand': 'NZD',
  'South Africa': 'ZAR',
  'Russia': 'RUB',
  'Turkey': 'TRY',
  'Saudi Arabia': 'SAR',
  'United Arab Emirates': 'AED',
  'Israel': 'ILS',
  'Thailand': 'THB',
  'Malaysia': 'MYR',
  'Indonesia': 'IDR',
  'Philippines': 'PHP',
  'Vietnam': 'VND',
  'Taiwan': 'TWD',
  'Hong Kong': 'HKD',
  'Ireland': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Portugal': 'EUR',
  'Finland': 'EUR',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Croatia': 'HRK',
  'Slovenia': 'EUR',
  'Slovakia': 'EUR',
  'Estonia': 'EUR',
  'Latvia': 'EUR',
  'Lithuania': 'EUR',
  'Luxembourg': 'EUR',
  'Malta': 'EUR',
  'Cyprus': 'EUR',
  'Greece': 'EUR',
  'Argentina': 'ARS',
  'Chile': 'CLP',
  'Colombia': 'COP',
  'Peru': 'PEN',
  'Venezuela': 'VES',
  'Uruguay': 'UYU',
  'Paraguay': 'PYG',
  'Bolivia': 'BOB',
  'Ecuador': 'USD',
  'Guyana': 'GYD',
  'Suriname': 'SRD',
  'Egypt': 'EGP',
  'Nigeria': 'NGN',
  'Kenya': 'KES',
  'Ghana': 'GHS',
  'Morocco': 'MAD',
  'Tunisia': 'TND',
  'Algeria': 'DZD',
  'Ethiopia': 'ETB',
  'Uganda': 'UGX',
  'Tanzania': 'TZS',
  'Zimbabwe': 'ZWL',
  'Botswana': 'BWP',
  'Namibia': 'NAD',
  'Zambia': 'ZMW',
  'Malawi': 'MWK',
  'Mozambique': 'MZN',
  'Angola': 'AOA',
  'Madagascar': 'MGA',
  'Mauritius': 'MUR',
  'Seychelles': 'SCR',
  'Comoros': 'KMF',
  'Djibouti': 'DJF',
  'Eritrea': 'ERN',
  'Somalia': 'SOS',
  'Sudan': 'SDG',
  'South Sudan': 'SSP',
  'Central African Republic': 'XAF',
  'Chad': 'XAF',
  'Cameroon': 'XAF',
  'Republic of the Congo': 'XAF',
  'Democratic Republic of the Congo': 'CDF',
  'Equatorial Guinea': 'XAF',
  'Gabon': 'XAF',
  'São Tomé and Príncipe': 'STN',
  'Cape Verde': 'CVE',
  'Guinea-Bissau': 'XOF',
  'Guinea': 'GNF',
  'Sierra Leone': 'SLE',
  'Liberia': 'LRD',
  'Ivory Coast': 'XOF',
  'Burkina Faso': 'XOF',
  'Mali': 'XOF',
  'Niger': 'XOF',
  'Senegal': 'XOF',
  'Gambia': 'GMD',
  'Guinea-Bissau': 'XOF',
  'Mauritania': 'MRU',
  'Benin': 'XOF',
  'Togo': 'XOF',
  'Ghana': 'GHS',
  'Burkina Faso': 'XOF',
  'Mali': 'XOF',
  'Niger': 'XOF',
  'Senegal': 'XOF',
  'Gambia': 'GMD',
  'Guinea-Bissau': 'XOF',
  'Mauritania': 'MRU',
  'Benin': 'XOF',
  'Togo': 'XOF'
};

// Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        manager: true,
        employees: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, department, country, managerId, hireDate } = req.body;
    const currency = countryCurrencyMap[country] || 'USD';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        department,
        country,
        currency,
        managerId,
        hireDate: new Date(hireDate),
      },
    });

    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        manager: true,
        employees: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, country, managerId } = req.body;
    const currency = countryCurrencyMap[country] || 'USD';

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        department,
        country,
        currency,
        managerId: managerId || null,
      },
    });

    const formattedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get expenses by user ID
app.get('/api/expenses/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        items: true,
        receipts: true,
        approvalActions: true,
        user: true,
      },
      orderBy: { submitDate: 'desc' },
    });

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      userId: expense.userId,
      submitDate: expense.submitDate.toISOString().split('T')[0],
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      description: expense.description,
      status: expense.status,
      items: expense.items.map(item => ({
        id: item.id,
        amount: Number(item.amount),
        date: item.date.toISOString().split('T')[0],
        description: item.description,
        category: item.category,
        currency: item.currency,
      })),
      receipts: expense.receipts.map(receipt => ({
        id: receipt.id,
        filePath: receipt.filePath,
        uploadDate: receipt.uploadDate.toISOString().split('T')[0],
      })),
      approvalActions: expense.approvalActions.map(action => ({
        id: action.id,
        userId: action.userId,
        userName: action.userName,
        actionType: action.actionType,
        actionDate: action.actionDate.toISOString().split('T')[0],
        comments: action.comments || '',
      })),
    }));

    res.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        items: true,
        receipts: true,
        approvalActions: true,
        user: true,
      },
      orderBy: { submitDate: 'desc' },
    });

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      userId: expense.userId,
      submitDate: expense.submitDate.toISOString().split('T')[0],
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      description: expense.description,
      status: expense.status,
      items: expense.items.map(item => ({
        id: item.id,
        amount: Number(item.amount),
        date: item.date.toISOString().split('T')[0],
        description: item.description,
        category: item.category,
        currency: item.currency,
      })),
      receipts: expense.receipts.map(receipt => ({
        id: receipt.id,
        filePath: receipt.filePath,
        uploadDate: receipt.uploadDate.toISOString().split('T')[0],
      })),
      approvalActions: expense.approvalActions.map(action => ({
        id: action.id,
        userId: action.userId,
        userName: action.userName,
        actionType: action.actionType,
        actionDate: action.actionDate.toISOString().split('T')[0],
        comments: action.comments || '',
      })),
    }));

    res.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { userId, description, items, receipts } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const currency = items[0]?.currency || 'USD';

    const expense = await prisma.expense.create({
      data: {
        userId,
        submitDate: new Date(),
        totalAmount,
        currency,
        description,
        status: 'pending',
        items: {
          create: items.map(item => ({
            amount: item.amount,
            date: new Date(item.date),
            description: item.description,
            category: item.category,
            currency: item.currency,
          })),
        },
        receipts: {
          create: (receipts || []).map(receipt => ({
            filePath: receipt.filePath,
            uploadDate: new Date(),
          })),
        },
      },
      include: {
        items: true,
        receipts: true,
        approvalActions: true,
        user: true,
      },
    });

    const formattedExpense = {
      id: expense.id,
      userId: expense.userId,
      submitDate: expense.submitDate.toISOString().split('T')[0],
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      description: expense.description,
      status: expense.status,
      items: expense.items.map(item => ({
        id: item.id,
        amount: Number(item.amount),
        date: item.date.toISOString().split('T')[0],
        description: item.description,
        category: item.category,
        currency: item.currency,
      })),
      receipts: expense.receipts.map(receipt => ({
        id: receipt.id,
        filePath: receipt.filePath,
        uploadDate: receipt.uploadDate.toISOString().split('T')[0],
      })),
      approvalActions: expense.approvalActions.map(action => ({
        id: action.id,
        userId: action.userId,
        userName: action.userName,
        actionType: action.actionType,
        actionDate: action.actionDate.toISOString().split('T')[0],
        comments: action.comments || '',
      })),
    };

    res.json(formattedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense status
app.patch('/api/expenses/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approverId, approverName, comments } = req.body;

    await prisma.$transaction(async (tx) => {
      // Update expense status
      await tx.expense.update({
        where: { id },
        data: { status },
      });

      // Create approval action
      await tx.approvalAction.create({
        data: {
          expenseId: id,
          userId: approverId,
          userName: approverName,
          actionType: status,
          comments,
        },
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating expense status:', error);
    res.status(500).json({ error: 'Failed to update expense status' });
  }
});

// Get company
app.get('/api/company', async (req, res) => {
  try {
    const company = await prisma.company.findFirst();

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      id: company.id,
      name: company.name,
      country: company.country,
      currency: company.currency,
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
app.post('/api/company', async (req, res) => {
  try {
    const { name, country, currency } = req.body;

    const company = await prisma.company.create({
      data: {
        name,
        country,
        currency,
      },
    });

    res.json({
      id: company.id,
      name: company.name,
      country: company.country,
      currency: company.currency,
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Get approval rules
app.get('/api/approval-rules', async (req, res) => {
  try {
    const rules = await prisma.approvalRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching approval rules:', error);
    res.status(500).json({ error: 'Failed to fetch approval rules' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: PostgreSQL (Neon)`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
