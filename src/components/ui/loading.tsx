import React from 'react';
import { cn } from '@/lib/utils';
import { IconLoader2 } from '@tabler/icons-react';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'fullscreen' | 'spinner' | 'bar' | 'skeleton-detail' | 'skeleton-grid';
  text?: string;
  overlay?: boolean;
}

export function Loading({
  variant = 'spinner',
  text,
  overlay = false,
  className,
  ...props
}: LoadingProps) {
  // 1. Fullscreen Glassmorphic Overlay Loader
  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md transition-all duration-300 animate-in fade-in',
          className
        )}
        {...props}
      >
        {/* Breathtaking spinning crochet-flower inspired SVG loader */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* External glow */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          
          {/* Inner Custom SVG Crochet Flower Spinner */}
          <svg
            className="w-16 h-16 text-primary animate-[spin_4s_linear_infinite]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Petal 1 */}
            <circle cx="50" cy="25" r="14" className="fill-primary/80 opacity-70" />
            {/* Petal 2 */}
            <circle cx="75" cy="50" r="14" className="fill-primary/90 opacity-80" />
            {/* Petal 3 */}
            <circle cx="50" cy="75" r="14" className="fill-primary" />
            {/* Petal 4 */}
            <circle cx="25" cy="50" r="14" className="fill-primary/90 opacity-80" />
            {/* Center pistil */}
            <circle cx="50" cy="50" r="12" className="fill-surface stroke-primary stroke-2" />
          </svg>

          {/* Micro loading spinner circling around the flower */}
          <div className="absolute inset-0 border-2 border-transparent border-t-primary/40 border-r-primary/40 rounded-full animate-spin duration-700" />
        </div>

        <div className="space-y-1.5 text-center px-4 max-w-sm animate-bounce duration-1000">
          <p className="font-headline font-black text-lg tracking-tight text-on-surface">
            {text || 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // 2. Detail Page Layout Skeleton (shimmer placeholder)
  if (variant === 'skeleton-detail') {
    return (
      <div
        className={cn(
          'w-full max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-pulse font-body',
          className
        )}
        {...props}
      >
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-40 bg-surface-container-high rounded-lg" />

        {/* Primary Row: Left 50% - Right 50% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Big Image placeholder */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square w-full bg-surface-container-high rounded-4xl" />
            <div className="grid grid-cols-4 gap-4">
              <div className="aspect-square bg-surface-container-high rounded-2xl" />
              <div className="aspect-square bg-surface-container-high rounded-2xl" />
              <div className="aspect-square bg-surface-container-high rounded-2xl" />
              <div className="aspect-square bg-surface-container-high rounded-2xl" />
            </div>
          </div>

          {/* Right Column: Title, Prices, Details */}
          <div className="lg:col-span-6 space-y-6 py-2">
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-surface-container-high rounded-xl" />
              <div className="h-4 w-1/3 bg-surface-container-high rounded-lg" />
            </div>

            <hr className="border-outline/5" />

            {/* Price & Stage */}
            <div className="flex gap-4 items-center">
              <div className="h-7 w-28 bg-surface-container-high rounded-xl" />
              <div className="h-5 w-20 bg-surface-container-high rounded-full" />
            </div>

            {/* Detailed text skeletons */}
            <div className="space-y-2.5">
              <div className="h-3 w-full bg-surface-container-high rounded-lg" />
              <div className="h-3 w-full bg-surface-container-high rounded-lg" />
              <div className="h-3 w-5/6 bg-surface-container-high rounded-lg" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="h-12 w-full bg-surface-container-high rounded-2xl" />
              <div className="h-12 w-full bg-surface-container-low border border-outline/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Grid / Card Skeleton Loading
  if (variant === 'skeleton-grid') {
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse w-full',
          className
        )}
        {...props}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-surface-container-lowest border border-outline/5 rounded-3xl p-4 space-y-4"
          >
            <div className="aspect-square w-full bg-surface-container-high rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-surface-container-high rounded-lg" />
              <div className="h-3 w-1/2 bg-surface-container-high rounded-lg" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 w-16 bg-surface-container-high rounded-md" />
              <div className="h-8 w-8 bg-surface-container-high rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 4. Sleek Continuous Sliding Progress Bar
  if (variant === 'bar') {
    return (
      <div
        className={cn(
          'relative w-full h-1 bg-primary/10 overflow-hidden rounded-full',
          className
        )}
        {...props}
      >
        <div className="absolute top-0 bottom-0 left-0 bg-primary w-1/2 rounded-full animate-[shimmer_1.5s_infinite_ease-in-out]" />
        
        {/* Style injection for the sliding progress bar shimmer effect */}
        <style jsx global>{`
          @keyframes shimmer {
            0% {
              left: -50%;
            }
            100% {
              left: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // 5. Default Circular Progress Spinner (Inline or absolute overlay)
  const spinnerElement = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <IconLoader2 className="w-8 h-8 animate-spin text-primary" stroke={2.5} />
        <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
      </div>
      {text && (
        <span className="text-xs font-semibold text-secondary tracking-wide uppercase animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        className={cn(
          'absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm transition-opacity animate-in fade-in',
          className
        )}
        {...props}
      >
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center p-6', className)} {...props}>
      {spinnerElement}
    </div>
  );
}
