import { Badge } from '@/components/ui/badge';
import { ExpenseStatus } from '@/types';

interface StatusBadgeProps {
  status: ExpenseStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants: Record<ExpenseStatus, 'default' | 'success' | 'warning' | 'destructive'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
  };

  const labels: Record<ExpenseStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <Badge variant={variants[status]} className="capitalize">
      {labels[status]}
    </Badge>
  );
};
