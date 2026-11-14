export default function Loading() {
  return (
    <div className="container-page py-12 sm:py-16" aria-busy>
      <div className="mx-auto max-w-3xl">
        <div className="skeleton h-12 w-2/3 rounded-xl" />
        <div className="skeleton mt-4 h-3 w-40 rounded-md" />
        <div className="mt-10 space-y-3">
          {[100, 95, 88, 92, 60, 0, 90, 84, 70].map((w, i) =>
            w === 0 ? <div key={i} className="h-4" /> : <div key={i} className="skeleton h-4 rounded-md" style={{ width: `${w}%` }} />,
          )}
        </div>
      </div>
    </div>
  );
}
