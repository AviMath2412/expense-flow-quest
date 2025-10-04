import { User, Company } from '@/types';
import { getUserById, createUser, getCompany, createCompany, getAllUsers } from './api-client';
import { getCurrencySymbol } from './country-api';

const AUTH_KEY = 'expense_auth_token';
const USER_KEY = 'expense_current_user';

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // In a real app, this would be an API call to authenticate
    // For now, we'll simulate by checking if user exists in database
    const users = await getAllUsers();
    const user = users.find((u) => u.email === email);
    
    if (user && password) {
      // Store mock JWT token
      localStorage.setItem(AUTH_KEY, 'mock-jwt-token-' + user.id);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(AUTH_KEY);
};

export const updateCurrentUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const signup = async (email: string, password: string, name: string, country: { code: string; name: string; currency: string; currencySymbol: string }): Promise<User | null> => {
  try {
    // Check if user already exists
    const users = await getAllUsers();
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return null;
    }

    // Create new admin user with country currency
    const newUser = await createUser({
      name,
      email,
      role: 'admin',
      department: 'Administration',
      country: country.name,
      currency: country.currency,
      hireDate: new Date().toISOString().split('T')[0],
    });

    if (!newUser) {
      return null;
    }

    // Create company with selected country and currency
    const companyName = `${name}'s Company`;
    await createCompany({
      name: companyName,
      country: country.name,
      currency: country.currency,
    });

    // Store auth
    localStorage.setItem(AUTH_KEY, 'mock-jwt-token-' + newUser.id);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    return newUser;
  } catch (error) {
    console.error('Signup error:', error);
    return null;
  }
};
