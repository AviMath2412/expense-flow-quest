import { useState } from 'react';
import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAllUsers, createUser, updateUser } from '@/lib/api-client';
import { countries, countryCurrencyMap } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Plus, Edit, Trash, KeyRound } from 'lucide-react';
import { UserRole, User } from '@/types';

const Users = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as UserRole,
    department: '',
    managerId: '',
    country: 'United States',
  });

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  // Load users on component mount
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const newUser = await createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        country: formData.country,
        managerId: formData.managerId || undefined,
        hireDate: new Date().toISOString().split('T')[0],
      });

      if (newUser) {
        setUsers([...users, newUser]);
        toast({
          title: 'User created',
          description: `${formData.name} has been added successfully`,
        });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = (email: string) => {
    const randomPassword = Math.random().toString(36).slice(-8);
    toast({
      title: 'Password reset',
      description: `New password: ${randomPassword} (sent to ${email})`,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      managerId: user.managerId || '',
      country: user.country,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updatedUser = await updateUser(editingUser, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        country: formData.country,
        managerId: formData.managerId || undefined,
      });

      if (updatedUser) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === editingUser ? updatedUser : user
        ));
        toast({
          title: 'User updated',
          description: `${formData.name}'s information has been updated`,
        });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: '',
      managerId: '',
      country: 'United States',
    });
    setEditingUser(null);
  };

  // Check permissions
  if (!hasPermission(currentUser, PERMISSIONS.MANAGE_USERS)) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              You do not have permission to manage users. Only administrators can access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              User Management
            </h2>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions. Create employees and managers, assign roles and manager relationships.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user information and manager assignment' : 'Add a new employee or manager to the system'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@company.com"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Sales"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Reporting Manager</Label>
                    <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((mgr) => (
                          <SelectItem key={mgr.id} value={mgr.id}>
                            {mgr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country of Residence</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country} ({countryCurrencyMap[country]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={editingUser ? handleUpdateUser : handleCreateUser} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${users.length} user(s) in the system`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading users...</p>
              ) : (
                users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.department} • {user.country} ({user.currency}) • Joined {new Date(user.hireDate).toLocaleDateString()}
                    </p>
                    {user.managerId && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Reports to: {users.find(u => u.id === user.managerId)?.name || 'Unknown Manager'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleResetPassword(user.email)}
                      title="Reset password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Edit user"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" title="Delete user">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;
