"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { buttonVariants } from "@/components/ui/button";
import { whatsappOrderHref } from "@/lib/whatsapp";
import type { Totals } from "@/lib/cart-totals";
import type { CartLine } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Goes to /checkout when payments and shipping are both set up; otherwise
 * skips checkout and opens WhatsApp with the cart written out as an order.
 */
export function CheckoutButton({
  lines,
  totals,
  className,
  onNavigate,
}: {
  lines: CartLine[];
  totals: Totals;
  className?: string;
  onNavigate?: () => void;
}) {
  const { integrations, identity } = useSiteSettings();
  const classes = cn(buttonVariants({ size: "lg" }), className);

  if (integrations.payments && integrations.shipping) {
    return (
      <Link href="/checkout" onClick={onNavigate} className={classes}>
        Checkout
      </Link>
    );
  }
  return (
    <a
      href={whatsappOrderHref(identity.whatsapp, identity.storeName, lines, totals)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={classes}
    >
      <MessageCircle className="mr-2 size-4" /> Order on WhatsApp
    </a>
  );
}
