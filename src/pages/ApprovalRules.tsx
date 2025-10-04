import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getAllUsers } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { Plus, Edit, Trash, Users, ArrowRight } from 'lucide-react';
import { User } from '@/types';

interface ApprovalStep {
  id: string;
  stepOrder: number;
  approverId: string;
  approverRole: string;
  isRequired: boolean;
  isAutoApproval: boolean;
}

interface ApprovalRule {
  id: string;
  employeeId: string;
  managerId?: string;
  isSequential: boolean;
  isManagerApprover: boolean;
  minApprovalPercentage: number;
  isActive: boolean;
  steps: ApprovalStep[];
}

const ApprovalRules = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  // Check permissions
  if (!hasPermission(currentUser, PERMISSIONS.CONFIGURE_APPROVAL_RULES)) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground">
              You do not have permission to configure approval rules. Only administrators can access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  const [formData, setFormData] = useState({
    employeeId: '',
    managerId: '',
    isSequential: true,
    isManagerApprover: true,
    minApprovalPercentage: 100,
    steps: [] as ApprovalStep[],
  });

  const employees = users.filter(u => u.role === 'employee');
  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  // Load users on component mount
  useEffect(() => {
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

  const addApprovalStep = () => {
    const newStep: ApprovalStep = {
      id: Date.now().toString(),
      stepOrder: formData.steps.length + 1,
      approverId: '',
      approverRole: '',
      isRequired: true,
      isAutoApproval: false,
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
  };

  const updateApprovalStep = (stepId: string, updates: Partial<ApprovalStep>) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const removeApprovalStep = (stepId: string) => {
    setFormData({
      ...formData,
      steps: formData.steps
        .filter(step => step.id !== stepId)
        .map((step, index) => ({ ...step, stepOrder: index + 1 })),
    });
  };

  const handleCreateRule = async () => {
    try {
      // In a real app, you'd call an API to create the approval rule
      toast({
        title: 'Approval rule created',
        description: 'Approval rule has been created successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating approval rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create approval rule',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      managerId: '',
      isSequential: true,
      isManagerApprover: true,
      minApprovalPercentage: 100,
      steps: [],
    });
    setEditingRule(null);
  };

  const getEmployeeName = (employeeId: string) => {
    return users.find(u => u.id === employeeId)?.name || 'Unknown Employee';
  };

  const getManagerName = (managerId: string) => {
    return users.find(u => u.id === managerId)?.name || 'Unknown Manager';
  };

  // Mock approval rules for demonstration
  const mockApprovalRules: ApprovalRule[] = [
    {
      id: '1',
      employeeId: '3', // Employee User
      managerId: '2', // Manager User
      isSequential: true,
      isManagerApprover: true,
      minApprovalPercentage: 100,
      isActive: true,
      steps: [
        {
          id: '1',
          stepOrder: 1,
          approverId: '2',
          approverRole: 'Manager',
          isRequired: true,
          isAutoApproval: false,
        },
        {
          id: '2',
          stepOrder: 2,
          approverId: '1',
          approverRole: 'Finance',
          isRequired: true,
          isAutoApproval: false,
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Approval Rules
            </h2>
            <p className="text-muted-foreground">
              Configure approval workflows for expense submissions
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit Approval Rule' : 'Create Approval Rule'}</DialogTitle>
                <DialogDescription>
                  Set up approval workflow for employee expense submissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isSequential"
                      checked={formData.isSequential}
                      onCheckedChange={(checked) => setFormData({ ...formData, isSequential: checked })}
                    />
                    <Label htmlFor="isSequential">Sequential Approval</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isManagerApprover"
                      checked={formData.isManagerApprover}
                      onCheckedChange={(checked) => setFormData({ ...formData, isManagerApprover: checked })}
                    />
                    <Label htmlFor="isManagerApprover">Manager is Approver</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minApprovalPercentage">Minimum Approval Percentage</Label>
                  <Input
                    id="minApprovalPercentage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.minApprovalPercentage}
                    onChange={(e) => setFormData({ ...formData, minApprovalPercentage: parseInt(e.target.value) || 100 })}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Approval Steps</Label>
                    <Button type="button" variant="outline" onClick={addApprovalStep}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Step
                    </Button>
                  </div>
                  
                  {formData.steps.map((step, index) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {step.stepOrder}</Badge>
                          {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeApprovalStep(step.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Approver</Label>
                          <Select
                            value={step.approverId}
                            onValueChange={(value) => {
                              const approver = users.find(u => u.id === value);
                              updateApprovalStep(step.id, {
                                approverId: value,
                                approverRole: approver?.role || '',
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select approver" />
                            </SelectTrigger>
                            <SelectContent>
                              {managers.map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name} ({manager.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={step.approverRole}
                            onChange={(e) => updateApprovalStep(step.id, { approverRole: e.target.value })}
                            placeholder="e.g., Finance, Director"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`required-${step.id}`}
                            checked={step.isRequired}
                            onCheckedChange={(checked) => updateApprovalStep(step.id, { isRequired: checked })}
                          />
                          <Label htmlFor={`required-${step.id}`}>Required</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`auto-${step.id}`}
                            checked={step.isAutoApproval}
                            onCheckedChange={(checked) => updateApprovalStep(step.id, { isAutoApproval: checked })}
                          />
                          <Label htmlFor={`auto-${step.id}`}>Auto-approve if approved</Label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleCreateRule} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approval Rules</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${mockApprovalRules.length} approval rule(s) configured`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading approval rules...</p>
              ) : (
                mockApprovalRules.map((rule) => (
                  <Card key={rule.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">
                            {getEmployeeName(rule.employeeId)}
                          </h3>
                          <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manager: {getManagerName(rule.managerId || '')} • 
                          Sequential: {rule.isSequential ? 'Yes' : 'No'} • 
                          Min Approval: {rule.minApprovalPercentage}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" title="Edit rule">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="Delete rule">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Approval Steps:</Label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {users.find(u => u.id === step.approverId)?.name || 'Unknown'}
                              {step.isAutoApproval && <span className="text-green-600">*</span>}
                            </Badge>
                            {index < rule.steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ApprovalRules;