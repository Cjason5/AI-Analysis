import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-bg-secondary',
        className
      )}
      {...props}
    />
  );
}

export function TokenCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border-color rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
