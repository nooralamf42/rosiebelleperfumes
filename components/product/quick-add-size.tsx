"use client";

import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/format";
import { productSizes } from "@/lib/sizes";
import type { StoreProduct } from "@/lib/types";

/** "+" on a product card for products with sizes: pick a size, add to cart. */
export function QuickAddSize({ product }: { product: StoreProduct }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const soldOut = product.stock <= 0;

  function addSize(size: string, price: number) {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: product.images[0] ?? null,
      accentColor: product.accentColor,
      size,
    });
    toast.success(`${product.name} (${size}) added to your bag`, {
      action: { label: "View cart", onClick: openCart },
    });
  }

  if (soldOut) {
    return (
      <Button variant="outline" disabled className="h-9 w-full rounded-none text-xs uppercase tracking-[0.12em]">
        Sold out
      </Button>
    );
  }

  return (
    // Not modal: a modal menu would lock page scrolling, which fights the smooth-scroll library.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Add ${product.name} to cart — choose a size`}
            className="h-9 w-full rounded-none text-xs uppercase tracking-[0.12em]"
          >
            Add to bag
          </Button>
        }
      />
      <DropdownMenuContent align="center" side="top" className="w-56 rounded-2xl p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pb-1 text-xs text-muted-foreground">Choose a size</DropdownMenuLabel>
          <div className="grid gap-1">
            {productSizes(product).map((s) => (
              <DropdownMenuItem
                key={s.label}
                onClick={() => addSize(s.label, s.price)}
                className="justify-between rounded-xl border px-3 py-2 text-sm focus:border-primary focus:bg-primary focus:text-primary-foreground"
              >
                <span className="font-medium">{s.label}</span>
                <span className="tabular-nums opacity-80">{formatPrice(s.price)}</span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
