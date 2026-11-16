/** Order detail skeleton: order number and status, then items, totals and the delivery details. */
export default function Loading() {
  return (
    <div className="container-page py-12 sm:py-16" aria-busy>
      <div className="skeleton h-4 w-28 rounded-md" />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="skeleton h-10 w-56 rounded-xl" />
        <div className="skeleton h-7 w-24 rounded-full" />
      </div>
      <div className="skeleton mt-3 h-4 w-48 rounded-md" />

      <div className="mt-8 rounded-3xl border bg-card p-6">
        <div className="skeleton h-6 w-20 rounded-md" />
        <ul className="mt-4 divide-y">
          {[0, 1].map((i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-3">
              <div className="skeleton h-4 w-1/2 rounded-md" />
              <div className="skeleton h-4 w-16 rounded-md" />
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-3 border-t pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton h-4 w-20 rounded-md" />
              <div className="skeleton h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-card p-6">
        <div className="skeleton h-6 w-40 rounded-md" />
        <div className="mt-4 space-y-2">
          <div className="skeleton h-4 w-40 rounded-md" />
          <div className="skeleton h-4 w-64 max-w-full rounded-md" />
          <div className="skeleton h-4 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
}
