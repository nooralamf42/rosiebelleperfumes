"use client";

import Image from "next/image";
import { BottlePhoto, BottleRow } from "./bottle-photo";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { bottleSizesOf } from "@/lib/sizes";
import { accentCss } from "@/lib/perfume-colors";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";

/** Soft colour wash behind a bottle, tinted by the perfume's accent colour. */
export function bottleBackdrop(accent: string): React.CSSProperties {
  return {
    background: `radial-gradient(120% 90% at 50% 100%, color-mix(in oklab, ${accentCss(accent)} 26%, var(--background)) 0%, color-mix(in oklab, ${accentCss(accent)} 8%, var(--background)) 60%, var(--background) 100%)`,
  };
}

/**
 * Product image if one is uploaded, otherwise the bottle photos: every size
 * the product comes in, standing side by side in the perfume's own colour,
 * with the product name printed on each label.
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
  const motion = "transition-transform duration-700 ease-out group-hover:scale-[1.04]";
  return (
    <div className={cn("absolute inset-0 overflow-hidden px-[3%] pb-[7%] pt-[8%]", className)} style={bottleBackdrop(product.accentColor)}>
      {bottleSizes.length > 1 ? (
        <BottleRow
          sizes={bottleSizes}
          accent={product.accentColor}
          name={product.name}
          brand={identity.storeName}
          priority={priority}
          className={cn("size-full origin-bottom", motion)}
        />
      ) : (
        <div className={cn("flex size-full origin-bottom items-end justify-center", motion)}>
          <BottlePhoto size={bottleSizes[0]} accent={product.accentColor} name={product.name} brand={identity.storeName} priority={priority} className="h-[88%]" />
        </div>
      )}
    </div>
  );
}
