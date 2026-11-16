/** Cart skeleton: a list of line items beside the order summary. */
export function CartSkeleton() {
  return (
    <div className="container-page py-12 sm:py-16" aria-busy>
      <div className="skeleton h-10 w-44 rounded-xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y rounded-3xl border bg-card">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex gap-4 p-4 sm:p-5">
              <div className="skeleton size-24 shrink-0 rounded-2xl" />
              <div className="flex flex-1 flex-col">
                <div className="skeleton h-5 w-2/3 rounded-md" />
                <div className="skeleton mt-2 h-3.5 w-1/3 rounded-md" />
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="skeleton h-10 w-28 rounded-full" />
                  <div className="skeleton h-5 w-16 rounded-md" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="h-max rounded-3xl border bg-card p-6">
          <div className="skeleton h-6 w-40 rounded-md" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="skeleton h-4 w-20 rounded-md" />
                <div className="skeleton h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
          <div className="skeleton mt-6 h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
