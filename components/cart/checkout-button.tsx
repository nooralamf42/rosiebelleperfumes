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
 * Goes to /checkout once online payments (Razorpay) are set up; until then
 * it skips checkout and opens WhatsApp with the cart written out as an order.
 * Shiprocket is optional: without it you ship orders yourself and tap
 * "Mark as shipped" on each one.
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

  if (integrations.payments) {
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
