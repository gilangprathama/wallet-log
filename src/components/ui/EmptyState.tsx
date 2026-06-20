import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-midnight-surface-2 mb-4">
        <Icon size={32} className="text-slate-500" />
      </div>
      <p className="text-slate-300 font-medium mb-1">{message}</p>
      {description && (
        <p className="text-slate-500 text-sm">{description}</p>
      )}
    </div>
  );
}
