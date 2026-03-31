import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-bg-secondary text-text-secondary',
    secondary: 'bg-bg-secondary text-text-secondary',
    success: 'bg-accent-green/20 text-accent-green',
    warning: 'bg-yellow-500/20 text-yellow-500',
    danger: 'bg-accent-red/20 text-accent-red',
    info: 'bg-accent-blue/20 text-accent-blue',
    outline: 'border border-border-color text-text-secondary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
