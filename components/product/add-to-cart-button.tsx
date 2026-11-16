"use client";

import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { priceForSize } from "@/lib/sizes";
import type { StoreProduct } from "@/lib/types";
import type { ComponentProps, ReactNode } from "react";

export function AddToCartButton({
  product,
  qty = 1,
  selectedSize = null,
  unitPrice,
  className,
  children,
  variant,
  size,
}: {
  product: StoreProduct;
  qty?: number;
  selectedSize?: string | null;
  /** Price of the chosen size, in paise. Defaults to the product price. */
  unitPrice?: number;
  className?: string;
  children?: ReactNode;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const soldOut = product.stock <= 0;
  const needsSize = product.sizes.length > 0 && !selectedSize;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={soldOut}
      className={cn("rounded-full", className)}
      onClick={() => {
        if (needsSize) {
          toast.error("Please select a size first");
          return;
        }
        add(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: unitPrice ?? priceForSize(product, selectedSize),
            image: product.images[0] ?? null,
            accentColor: product.accentColor,
            size: selectedSize,
          },
          qty,
        );
        toast.success(`${product.name} added to your cart`, {
          action: { label: "View cart", onClick: openCart },
        });
      }}
    >
      {soldOut ? "Sold out" : (children ?? "Add to cart")}
    </Button>
  );
}
