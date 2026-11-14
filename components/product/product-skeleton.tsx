import { cn } from "@/lib/utils";

/** Placeholder that matches ProductCard's layout exactly, so nothing jumps. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)} aria-hidden>
      <div className="skeleton aspect-[4/5] rounded-3xl" />
      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-2/3 rounded-md" />
            <div className="skeleton h-3 w-1/2 rounded-md" />
          </div>
          <div className="skeleton h-4 w-14 rounded-md" />
        </div>
        <div className="skeleton mt-4 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
