import { prisma } from './db'
import { User, ExpenseRequest, Company, ApprovalRule } from '@/types'
import { countryCurrencyMap } from './mockData'

// User operations
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        manager: true,
        employees: true,
      },
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'manager' | 'employee',
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        manager: true,
        employees: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'manager' | 'employee',
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const createUser = async (userData: {
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  department: string
  country: string
  managerId?: string
  hireDate: string
}): Promise<User | null> => {
  try {
    const currency = countryCurrencyMap[userData.country] || 'USD'
    
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        country: userData.country,
        currency,
        managerId: userData.managerId,
        hireDate: new Date(userData.hireDate),
      },
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'manager' | 'employee',
      department: user.department,
      country: user.country,
      currency: user.currency,
      managerId: user.managerId || undefined,
      hireDate: user.hireDate.toISOString().split('T')[0],
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Expense operations
export const getExpensesByUserId = async (userId: string): Promise<ExpenseRequest[]> => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        items: true,
        receipts: true,
        approvalActions: true,
        user: true,
      },
      orderBy: { submitDate: 'desc' },
    })

    return expenses.map(expense => ({
      id: expense.id,
      userId: expense.userId,
      submitDate: expense.submitDate.toISOString().split('T')[0],
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      description: expense.description,
      status: expense.status as 'pending' | 'approved' | 'rejected',
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
        actionType: action.actionType as 'approved' | 'rejected',
        actionDate: action.actionDate.toISOString().split('T')[0],
        comments: action.comments || undefined,
      })),
    }))
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export const getAllExpenses = async (): Promise<ExpenseRequest[]> => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        items: true,
        receipts: true,
        approvalActions: true,
        user: true,
      },
      orderBy: { submitDate: 'desc' },
    })

    return expenses.map(expense => ({
      id: expense.id,
      userId: expense.userId,
      submitDate: expense.submitDate.toISOString().split('T')[0],
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      description: expense.description,
      status: expense.status as 'pending' | 'approved' | 'rejected',
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
        actionType: action.actionType as 'approved' | 'rejected',
        actionDate: action.actionDate.toISOString().split('T')[0],
        comments: action.comments || undefined,
      })),
    }))
  } catch (error) {
    console.error('Error fetching all expenses:', error)
    return []
  }
}

export const createExpense = async (expenseData: {
  userId: string
  description: string
  items: Array<{
    amount: number
    date: string
    description: string
    category: string
    currency: string
  }>
  receipts?: Array<{
    filePath: string
  }>
}): Promise<ExpenseRequest | null> => {
  try {
    const totalAmount = expenseData.items.reduce((sum, item) => sum + item.amount, 0)
    const currency = expenseData.items[0]?.currency || 'USD'

    const expense = await prisma.expense.create({
      data: {
        userId: expenseData.userId,
        submitDate: new Date(),
        totalAmount,
        currency,
        description: expenseData.description,
        status: 'pending',
        items: {
          create: expenseData.items.map(item => ({
            amount: item.amount,
            date: new Date(item.date),
            description: item.description,
            category: item.category,
            currency: item.currency,
          })),
        },
        receipts: {
          create: expenseData.receipts?.map(receipt => ({
            filePath: receipt.filePath,
            uploadDate: new Date(),
          })) || [],
        },
      },
      include: {
        items: true,
        receipts: true,
        approvalActions: true,
        user: true,
      },
    })

    return {
      id: expense.id,
      userId: expense.userId,
      submitDate: expense.submitDate.toISOString().split('T')[0],
      totalAmount: Number(expense.totalAmount),
      currency: expense.currency,
      description: expense.description,
      status: expense.status as 'pending' | 'approved' | 'rejected',
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
        actionType: action.actionType as 'approved' | 'rejected',
        actionDate: action.actionDate.toISOString().split('T')[0],
        comments: action.comments || undefined,
      })),
    }
  } catch (error) {
    console.error('Error creating expense:', error)
    return null
  }
}

export const updateExpenseStatus = async (
  expenseId: string,
  status: 'approved' | 'rejected',
  approverId: string,
  approverName: string,
  comments?: string
): Promise<boolean> => {
  try {
    await prisma.$transaction(async (tx) => {
      // Update expense status
      await tx.expense.update({
        where: { id: expenseId },
        data: { status },
      })

      // Add approval action
      await tx.approvalAction.create({
        data: {
          expenseId,
          userId: approverId,
          userName: approverName,
          actionType: status,
          comments,
        },
      })
    })

    return true
  } catch (error) {
    console.error('Error updating expense status:', error)
    return false
  }
}

// Company operations
export const getCompany = async (): Promise<Company | null> => {
  try {
    const company = await prisma.company.findFirst()
    
    if (!company) return null

    return {
      id: company.id,
      name: company.name,
      country: company.country,
      currency: company.currency,
    }
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

export const createCompany = async (companyData: {
  name: string
  country: string
  currency: string
}): Promise<Company | null> => {
  try {
    const company = await prisma.company.create({
      data: companyData,
    })

    return {
      id: company.id,
      name: company.name,
      country: company.country,
      currency: company.currency,
    }
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

// Approval rules operations
export const getApprovalRules = async (): Promise<ApprovalRule[]> => {
  try {
    const rules = await prisma.approvalRule.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return rules.map(rule => ({
      id: rule.id,
      employeeId: rule.employeeId,
      managerId: rule.managerId || undefined,
      approvers: JSON.parse(rule.approvers),
      isSequential: rule.isSequential,
      isManagerApprover: rule.isManagerApprover,
      minApprovalPercentage: rule.minApprovalPercentage,
      isActive: rule.isActive,
    }))
  } catch (error) {
    console.error('Error fetching approval rules:', error)
    return []
  }
}
