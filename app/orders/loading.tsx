export default function Loading() {
  return (
    <div className="container-page py-12 sm:py-16" aria-busy>
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-foreground/10 p-5">
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-32 rounded-md" />
              <div className="skeleton h-6 w-20 rounded-full" />
            </div>
            <div className="mt-4 flex gap-3">
              <div className="skeleton size-16 rounded-2xl" />
              <div className="skeleton size-16 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
