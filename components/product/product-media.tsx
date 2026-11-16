"use client";

import Image from "next/image";
import { AttarBottle, AttarLineup } from "./attar-bottle";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { bottleSizesOf, type BottleSize } from "@/lib/sizes";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";

/** Soft colour wash behind a bottle, tinted by the perfume's accent colour. */
export function bottleBackdrop(accent: string): React.CSSProperties {
  return {
    background: `radial-gradient(120% 90% at 50% 100%, color-mix(in oklab, var(--${accent}) 26%, var(--background)) 0%, color-mix(in oklab, var(--${accent}) 8%, var(--background)) 60%, var(--background) 100%)`,
  };
}

/**
 * Product image if one is uploaded, otherwise the illustrated bottles: all
 * the sizes standing side by side, in the perfume's own colour.
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
  const { identity } = useSiteSettings();
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

  const bottleSizes = bottleSizesOf(product);
  return (
    <div className={cn("absolute inset-0 flex items-end justify-center overflow-hidden px-[5%] pb-[7%]", className)} style={bottleBackdrop(product.accentColor)}>
      {bottleSizes.length > 1 ? (
        <AttarLineup
          sizes={bottleSizes}
          accent={product.accentColor}
          name={product.name}
          brand={identity.storeName}
          className="w-full drop-shadow-[0_14px_16px_rgba(40,20,10,0.18)] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />
      ) : (
        <AttarBottle
          size={(bottleSizes[0] ?? "12") as BottleSize}
          accent={product.accentColor}
          name={product.name}
          brand={identity.storeName}
          className="h-[88%] w-auto drop-shadow-[0_14px_16px_rgba(40,20,10,0.18)] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />
      )}
    </div>
  );
}
