import { ProductGridSkeleton } from "@/components/product/product-skeleton";

export default function Loading() {
  return (
    <div className="container-page py-10 sm:py-14" aria-busy>
      <div className="skeleton h-3 w-16 rounded-md" />
      <div className="skeleton mt-4 h-12 w-72 rounded-xl sm:h-14 sm:w-[28rem]" />
      <div className="skeleton mt-4 h-4 w-80 rounded-md" />
      <div className="mt-8 flex gap-2 border-y border-foreground/10 py-3">
        {[16, 28, 24, 20, 26].map((w, i) => (
          <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <ProductGridSkeleton className="mt-10" />
    </div>
  );
}
