import { ProductGridSkeleton } from "@/components/product/product-skeleton";

/** Home skeleton: hero, ticker strip, five collection tiles, then a product row. */
export default function Loading() {
  return (
    <div aria-busy>
      {/* hero */}
      <div className="container-page grid min-h-[calc(100svh-4rem)] items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="skeleton h-7 w-56 rounded-full" />
          <div className="mt-7 space-y-3">
            <div className="skeleton h-16 w-full max-w-xl rounded-2xl" />
            <div className="skeleton h-16 w-4/5 max-w-lg rounded-2xl" />
          </div>
          <div className="mt-7 space-y-2">
            <div className="skeleton h-4 w-full max-w-md rounded-md" />
            <div className="skeleton h-4 w-3/4 max-w-sm rounded-md" />
          </div>
          <div className="mt-9 flex gap-3">
            <div className="skeleton h-12 w-44 rounded-full" />
            <div className="skeleton h-12 w-36 rounded-full" />
          </div>
        </div>
        <div className="skeleton mx-auto aspect-[4/5.4] w-full max-w-[460px] rounded-t-[999px] rounded-b-[2rem]" />
      </div>

      {/* ticker */}
      <div className="skeleton h-14 w-full rounded-none" />

      {/* collections */}
      <div className="container-page py-20 sm:py-28">
        <div className="skeleton h-3 w-24 rounded-md" />
        <div className="skeleton mt-4 h-12 w-72 rounded-xl sm:w-96" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`skeleton aspect-[3/4] rounded-[1.75rem] ${i % 2 === 1 ? "lg:translate-y-10" : ""}`} />
          ))}
        </div>
      </div>

      {/* featured products */}
      <div className="container-page pb-20">
        <div className="skeleton h-3 w-28 rounded-md" />
        <div className="skeleton mt-4 h-12 w-80 rounded-xl" />
        <ProductGridSkeleton count={4} className="mt-12" />
      </div>
    </div>
  );
}
