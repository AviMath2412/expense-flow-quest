export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  managerId?: string;
  hireDate: string;
  country: string;
  currency: string;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  currency: string;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  currency: string;
}

export interface Receipt {
  id: string;
  filePath: string;
  uploadDate: string;
}

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface ExpenseRequest {
  id: string;
  userId: string;
  submitDate: string;
  totalAmount: number;
  currency: string;
  description: string;
  status: ExpenseStatus;
  items: ExpenseItem[];
  receipts: Receipt[];
  approvalActions: ApprovalAction[];
}

export interface ApprovalAction {
  id: string;
  userId: string;
  userName: string;
  actionType: 'approved' | 'rejected';
  actionDate: string;
  comments?: string;
}

export interface ApprovalFlow {
  id: string;
  departmentId: string;
  steps: ApprovalStep[];
  isActive: boolean;
}

export interface ApprovalStep {
  id: string;
  stepOrder: number;
  approverRoleId: string;
  isRequired: boolean;
}

export interface ApprovalRule {
  id: string;
  employeeId: string;
  managerId?: string;
  approvers: string[];
  isSequential: boolean;
  isManagerApprover: boolean;
  minApprovalPercentage: number;
  isActive: boolean;
}
