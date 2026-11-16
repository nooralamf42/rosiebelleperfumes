/** Order confirmation skeleton: a centred card with a badge, headline, order number and buttons. */
export default function Loading() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16" aria-busy>
      <div className="w-full max-w-lg text-center">
        <div className="skeleton mx-auto size-20 rounded-full" />
        <div className="skeleton mx-auto mt-6 h-10 w-72 max-w-full rounded-xl" />
        <div className="mx-auto mt-4 max-w-sm space-y-2">
          <div className="skeleton h-4 w-full rounded-md" />
          <div className="skeleton h-4 w-4/5 rounded-md" />
        </div>
        <div className="skeleton mx-auto mt-6 h-14 w-56 rounded-2xl" />
        <div className="mt-8 flex justify-center gap-3">
          <div className="skeleton h-12 w-40 rounded-full" />
          <div className="skeleton h-12 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
