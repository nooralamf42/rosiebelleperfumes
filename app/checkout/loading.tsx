export default function Loading() {
  return (
    <div className="container-page py-12 sm:py-16" aria-busy>
      <div className="skeleton h-10 w-40 rounded-xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    </div>
  );
}
