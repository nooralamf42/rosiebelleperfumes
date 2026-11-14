export default function Loading() {
  return (
    <div className="container-page py-8 sm:py-12" aria-busy>
      <div className="skeleton h-3 w-40 rounded-md" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="skeleton aspect-[4/5] rounded-[2rem]" />
        <div>
          <div className="skeleton h-3 w-48 rounded-md" />
          <div className="skeleton mt-4 h-12 w-3/4 rounded-xl" />
          <div className="skeleton mt-5 h-7 w-32 rounded-md" />
          <div className="mt-6 space-y-2">
            <div className="skeleton h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-11/12 rounded-md" />
            <div className="skeleton h-4 w-2/3 rounded-md" />
          </div>
          <div className="mt-6 flex gap-2">
            {[20, 28, 24].map((w, i) => (
              <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
          <div className="skeleton mt-7 h-28 rounded-3xl" />
          <div className="mt-8 flex gap-3">
            <div className="skeleton h-12 w-32 rounded-full" />
            <div className="skeleton h-12 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
