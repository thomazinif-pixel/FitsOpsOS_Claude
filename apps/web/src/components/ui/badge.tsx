import { cn } from '@/lib/utils';
import { StatusKPI, StatusPlano } from '@/types';
import { statusColors, statusLabels, statusPlanoColors, statusPlanoLabels } from '@/lib/utils';

export function StatusBadge({ status }: { status: StatusKPI }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', statusColors[status])}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        status === 'GREEN' ? 'bg-green-500' : status === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500'
      )} />
      {statusLabels[status]}
    </span>
  );
}

export function PlanoBadge({ status }: { status: StatusPlano }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', statusPlanoColors[status])}>
      {statusPlanoLabels[status]}
    </span>
  );
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
      ✦ IA
    </span>
  );
}
