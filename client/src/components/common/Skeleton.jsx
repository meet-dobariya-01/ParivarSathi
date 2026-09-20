import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white p-5 rounded-md border border-gov-border space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="pt-3 border-t border-slate-100 flex justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-24 rounded" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white border border-gov-border rounded-md p-4 space-y-3">
    <div className="flex gap-4 pb-3 border-b border-gov-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 py-2">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
