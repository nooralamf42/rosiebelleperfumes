/** Sign-in skeleton: the centred card the Clerk form appears in. */
export default function Loading() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12" aria-busy>
      <div className="w-full max-w-[26rem] rounded-2xl border bg-card p-8 shadow-soft">
        <div className="skeleton mx-auto h-7 w-56 rounded-lg" />
        <div className="skeleton mx-auto mt-3 h-4 w-48 rounded-md" />
        <div className="skeleton mt-8 h-11 w-full rounded-xl" />
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <div className="skeleton h-3 w-6 rounded-md" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="skeleton mb-2 h-3.5 w-24 rounded-md" />
        <div className="skeleton h-11 w-full rounded-xl" />
        <div className="skeleton mt-6 h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
