"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";
import type { ReactNode } from "react";
import { useAddLine } from "./add-to-cart-button";

/**
 * "Buy now": puts the chosen size and quantity in the bag and goes straight to
 * checkout, skipping the cart drawer. Until online payments are set up there
 * is no checkout, so it opens the bag instead, where "Order on WhatsApp" is.
 */
export function BuyNowButton({
  product,
  qty = 1,
  selectedSize = null,
  unitPrice,
  className,
  children,
}: {
  product: StoreProduct;
  qty?: number;
  selectedSize?: string | null;
  unitPrice?: number;
  className?: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const openCart = useCart((s) => s.open);
  const { integrations } = useSiteSettings();
  const { soldOut, addLine } = useAddLine({ product, qty, selectedSize, unitPrice });

  return (
    <Button
      size="lg"
      disabled={soldOut}
      className={cn("rounded-full", className)}
      onClick={() => {
        if (!addLine()) return;
        if (integrations.payments) router.push("/checkout");
        else openCart();
      }}
    >
      {soldOut ? "Sold out" : (children ?? "Buy now")}
    </Button>
  );
}
