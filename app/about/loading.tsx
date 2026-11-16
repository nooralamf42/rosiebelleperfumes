/** About skeleton: title and lead paragraph, a wide photo, then two image-and-text sections. */
export default function Loading() {
  return (
    <div className="pb-8" aria-busy>
      <header className="container-page pt-12 sm:pt-20">
        <div className="skeleton h-3 w-16 rounded-md" />
        <div className="skeleton mt-5 h-16 w-72 rounded-2xl sm:h-20 sm:w-[28rem]" />
        <div className="mt-8 max-w-2xl space-y-3">
          <div className="skeleton h-7 w-full rounded-lg" />
          <div className="skeleton h-7 w-5/6 rounded-lg" />
        </div>
        <div className="skeleton mt-12 aspect-[16/9] w-full rounded-[2rem]" />
      </header>

      <div className="mt-20 space-y-24 sm:space-y-32">
        {[false, true].map((flip, i) => (
          <section key={i} className="container-page">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <div className={`skeleton aspect-[4/5] rounded-[2rem] ${flip ? "lg:order-2" : ""}`} />
              <div className={`max-w-lg ${flip ? "lg:order-1 lg:justify-self-end" : ""}`}>
                <div className="skeleton h-3 w-8 rounded-md" />
                <div className="skeleton mt-4 h-12 w-64 rounded-xl" />
                <div className="mt-6 space-y-3">
                  <div className="skeleton h-4 w-full rounded-md" />
                  <div className="skeleton h-4 w-full rounded-md" />
                  <div className="skeleton h-4 w-4/5 rounded-md" />
                  <div className="skeleton mt-6 h-4 w-3/5 rounded-md" />
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
