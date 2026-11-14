import Image from "next/image";
import { ProductGraphic } from "./product-graphic";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";

/**
 * Product image if one is uploaded, otherwise the illustrated bottle on a
 * tinted backdrop that uses the product's accent colour.
 */
export function ProductMedia({
  product,
  priority,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className,
}: {
  product: StoreProduct;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const img = product.images?.[0];
  if (img) {
    return (
      <Image
        src={img}
        alt={product.name}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]", className)}
      />
    );
  }
  return (
    <div
      className={cn("absolute inset-0 flex items-end justify-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 50% 100%, color-mix(in oklab, var(--${product.accentColor}) 28%, var(--background)) 0%, color-mix(in oklab, var(--${product.accentColor}) 8%, var(--background)) 60%, var(--background) 100%)`,
      }}
    >
      <ProductGraphic
        type={product.type}
        accent={product.accentColor}
        label={product.name}
        className="h-[88%] w-auto translate-y-[2%] drop-shadow-[0_18px_24px_rgba(60,35,10,0.18)] transition-transform duration-700 ease-out group-hover:-translate-y-[2%] group-hover:scale-[1.04] group-hover:-rotate-2"
      />
    </div>
  );
}
