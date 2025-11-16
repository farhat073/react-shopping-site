interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton = ({ className = '', lines = 1 }: LoadingSkeletonProps) => {
  if (lines === 1) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
          style={{
            width: index === lines - 1 ? '60%' : '100%', // Last line shorter
          }}
        />
      ))}
    </div>
  );
};

// Product card skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="aspect-square bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-6 w-20" />
        <LoadingSkeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-3">
        <LoadingSkeleton className="h-10 flex-1" />
        <LoadingSkeleton className="h-10 flex-1" />
      </div>
    </div>
  </div>
);

// Cart item skeleton
export const CartItemSkeleton = () => (
  <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
    <LoadingSkeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-3 w-1/2" />
    </div>
    <LoadingSkeleton className="h-4 w-16" />
  </div>
);