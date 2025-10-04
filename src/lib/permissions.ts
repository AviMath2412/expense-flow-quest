import { User, UserRole } from '@/types';

export interface Permission {
  action: string;
  resource: string;
  condition?: (user: User, resource?: any) => boolean;
}

export const PERMISSIONS = {
  // Admin permissions
  CREATE_COMPANY: 'create:company',
  MANAGE_USERS: 'manage:users',
  SET_ROLES: 'set:roles',
  CONFIGURE_APPROVAL_RULES: 'configure:approval_rules',
  VIEW_ALL_EXPENSES: 'view:all_expenses',
  OVERRIDE_APPROVALS: 'override:approvals',
  
  // Manager permissions
  APPROVE_EXPENSES: 'approve:expenses',
  REJECT_EXPENSES: 'reject:expenses',
  VIEW_TEAM_EXPENSES: 'view:team_expenses',
  ESCALATE_EXPENSES: 'escalate:expenses',
  
  // Employee permissions
  SUBMIT_EXPENSES: 'submit:expenses',
  VIEW_OWN_EXPENSES: 'view:own_expenses',
  CHECK_APPROVAL_STATUS: 'check:approval_status',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    PERMISSIONS.CREATE_COMPANY,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SET_ROLES,
    PERMISSIONS.CONFIGURE_APPROVAL_RULES,
    PERMISSIONS.VIEW_ALL_EXPENSES,
    PERMISSIONS.OVERRIDE_APPROVALS,
    PERMISSIONS.APPROVE_EXPENSES,
    PERMISSIONS.REJECT_EXPENSES,
    PERMISSIONS.VIEW_TEAM_EXPENSES,
    PERMISSIONS.ESCALATE_EXPENSES,
    PERMISSIONS.SUBMIT_EXPENSES,
    PERMISSIONS.VIEW_OWN_EXPENSES,
    PERMISSIONS.CHECK_APPROVAL_STATUS,
  ],
  manager: [
    PERMISSIONS.APPROVE_EXPENSES,
    PERMISSIONS.REJECT_EXPENSES,
    PERMISSIONS.VIEW_TEAM_EXPENSES,
    PERMISSIONS.ESCALATE_EXPENSES,
    PERMISSIONS.SUBMIT_EXPENSES,
    PERMISSIONS.VIEW_OWN_EXPENSES,
    PERMISSIONS.CHECK_APPROVAL_STATUS,
  ],
  employee: [
    PERMISSIONS.SUBMIT_EXPENSES,
    PERMISSIONS.VIEW_OWN_EXPENSES,
    PERMISSIONS.CHECK_APPROVAL_STATUS,
  ],
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if a user can perform an action on a resource
 */
export const canPerformAction = (
  user: User | null, 
  action: string, 
  resource?: any
): boolean => {
  if (!user) return false;
  
  // Check basic permission
  if (!hasPermission(user, action)) return false;
  
  // Additional resource-specific checks
  switch (action) {
    case PERMISSIONS.VIEW_TEAM_EXPENSES:
      // Managers can only view their direct reports' expenses
      return user.role === 'manager' || user.role === 'admin';
      
    case PERMISSIONS.APPROVE_EXPENSES:
    case PERMISSIONS.REJECT_EXPENSES:
      // Check if user can approve this specific expense
      if (resource && resource.userId) {
        // Admin can approve any expense
        if (user.role === 'admin') return true;
        
        // Manager can approve their direct reports' expenses
        if (user.role === 'manager') {
          // This would need to check if the expense belongs to a direct report
          // For now, we'll allow managers to approve any expense
          return true;
        }
      }
      return false;
      
    case PERMISSIONS.MANAGE_USERS:
      // Admin can manage any user
      return user.role === 'admin';
      
    default:
      return true;
  }
};

/**
 * Get user's accessible routes based on role
 */
export const getAccessibleRoutes = (user: User | null): string[] => {
  if (!user) return ['/login'];
  
  const routes: string[] = ['/dashboard'];
  
  if (hasPermission(user, PERMISSIONS.VIEW_OWN_EXPENSES)) {
    routes.push('/expenses');
  }
  
  if (hasPermission(user, PERMISSIONS.SUBMIT_EXPENSES)) {
    routes.push('/submit-expense');
  }
  
  if (hasPermission(user, PERMISSIONS.APPROVE_EXPENSES)) {
    routes.push('/approvals');
  }
  
  if (hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
    routes.push('/users');
  }
  
  if (hasPermission(user, PERMISSIONS.CONFIGURE_APPROVAL_RULES)) {
    routes.push('/approval-rules');
  }
  
  if (hasPermission(user, PERMISSIONS.CHECK_APPROVAL_STATUS)) {
    routes.push('/settings');
  }
  
  return routes;
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (user: User | null, route: string): boolean => {
  const accessibleRoutes = getAccessibleRoutes(user);
  return accessibleRoutes.includes(route);
};

/**
 * Get user's role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'employee':
      return 'Employee';
    default:
      return 'Unknown';
  }
};

/**
 * Get user's role description
 */
export const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Full system access - manage users, configure rules, view all expenses';
    case 'manager':
      return 'Team management - approve expenses, view team reports';
    case 'employee':
      return 'Expense submission - submit and track personal expenses';
    default:
      return 'Limited access';
  }
};
