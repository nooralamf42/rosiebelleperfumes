/** Track order skeleton: heading, intro lines and the two-field form card. */
export default function Loading() {
  return (
    <div className="container-page py-12 sm:py-16" aria-busy>
      <div className="mx-auto max-w-md">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="mt-3 space-y-2">
          <div className="skeleton h-4 w-full rounded-md" />
          <div className="skeleton h-4 w-3/4 rounded-md" />
        </div>
        <div className="mt-8 rounded-3xl border bg-card p-6">
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="skeleton mb-2 h-3.5 w-28 rounded-md" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
            ))}
            <div className="skeleton h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
