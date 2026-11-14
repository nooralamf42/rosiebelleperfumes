import type { CartLine } from "@/lib/types";
import type { Totals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/format";

/** Used until the owner sets a number in Admin → Settings → Identity. Replace it there. */
export const DEFAULT_WHATSAPP = "919999999999";

/** wa.me needs the country code; assume India (+91) for a bare 10-digit number. */
export function whatsappDigits(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 10) return DEFAULT_WHATSAPP;
  return digits.length === 10 ? `91${digits}` : digits;
}

/** wa.me link that opens a chat with the cart already written out as an order request. */
export function whatsappOrderHref(
  number: string | undefined,
  storeName: string,
  lines: CartLine[],
  totals: Pick<Totals, "subtotal" | "discount" | "shipping" | "total">,
): string {
  const items = lines.map(
    (l, i) =>
      `${i + 1}. ${l.name}${l.size ? ` (${l.size})` : ""} × ${l.quantity} — ${formatPrice(l.price * l.quantity)}`,
  );
  const text = [
    `Hi ${storeName}, I'd like to place an order:`,
    "",
    ...items,
    "",
    `Subtotal: ${formatPrice(totals.subtotal)}`,
    ...(totals.discount > 0 ? [`Discount: -${formatPrice(totals.discount)}`] : []),
    `Shipping: ${totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}`,
    `Total: ${formatPrice(totals.total)}`,
    "",
    "Please confirm availability and share the payment details.",
  ].join("\n");
  return `https://wa.me/${whatsappDigits(number)}?text=${encodeURIComponent(text)}`;
}
