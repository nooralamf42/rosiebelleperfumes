import { cn } from "@/lib/utils";

/*
 * Loading placeholders for the admin. Each mirrors the real screen's layout so
 * nothing jumps when the data arrives. They use the shared shimmer (.skeleton).
 */

export function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden />;
}

export function HeadingSkeleton({ action = false, subtitle = false }: { action?: boolean; subtitle?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <Sk className="h-8 w-40 rounded-lg" />
        {subtitle && <Sk className="mt-3 h-4 w-72 max-w-full rounded-md" />}
      </div>
      {action && <Sk className="h-10 w-32 shrink-0 rounded-full" />}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-4 sm:p-5">
          <Sk className="size-10 rounded-xl" />
          <Sk className="mt-4 h-4 w-20 rounded-md" />
          <Sk className="mt-2 h-8 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Rows that stand in for a table on desktop and tappable rows on phones. */
export function ListSkeleton({ rows = 8, thumb = true, className }: { rows?: number; thumb?: boolean; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", className)} aria-hidden>
      <div className="hidden border-b px-4 py-3 md:flex md:gap-8">
        {["w-40", "w-16", "w-12", "w-14"].map((w) => (
          <Sk key={w} className={cn("h-4 rounded-md", w)} />
        ))}
      </div>
      <ul className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 p-3 md:px-4 md:py-3">
            {thumb && <Sk className="size-10 shrink-0 rounded-lg" />}
            <div className="min-w-0 flex-1 space-y-2">
              <Sk className="h-4 w-1/2 rounded-md md:w-1/3" />
              <Sk className="h-3 w-1/3 rounded-md md:hidden" />
            </div>
            <Sk className="hidden h-4 w-16 rounded-md md:block" />
            <Sk className="hidden h-4 w-10 rounded-md md:block" />
            <Sk className="h-6 w-16 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FormCardSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4 sm:p-6", className)} aria-hidden>
      <Sk className="h-6 w-44 rounded-md" />
      <Sk className="mt-2 h-4 w-72 max-w-full rounded-md" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Sk className="mb-2 h-3.5 w-24 rounded-md" />
            <Sk className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
