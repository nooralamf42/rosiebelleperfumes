import { after } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { db, hasDatabase } from "@/lib/db";
import { getSettings, siteBaseUrl } from "@/lib/settings";
import { orderLinkToken } from "@/lib/order-access";
import { bottleAccent } from "@/lib/perfume-colors";
import { bottleSizeOf } from "@/lib/sizes";
import { sendingDomain, senderLocalPart } from "./sender";
import { getIntegrations } from "@/lib/integrations";
import { OrderEmail, type OrderEmailKind } from "./order-email";
import type { IdentitySettings } from "@/lib/settings/schema";

export type { OrderEmailKind } from "./order-email";

/*
 * The Resend key comes from Admin → Settings → Integrations (encrypted in the
 * database) or the RESEND_API_KEY environment variable. It is read when an
 * email is sent, never while a page loads, so it adds no delay for shoppers.
 */
let cachedClient: { key: string; client: Resend } | null = null;

export async function getResend(): Promise<Resend | null> {
  const { resend } = await getIntegrations();
  if (!resend) return null;
  if (cachedClient?.key !== resend.apiKey) cachedClient = { key: resend.apiKey, client: new Resend(resend.apiKey) };
  return cachedClient.client;
}

export async function isEmailEnabled(): Promise<boolean> {
  return Boolean((await getIntegrations()).resend);
}

/**
 * "Store Name <address>". The name is always the store name from Settings. The
 * part before the @ is what the owner typed (Settings > Store & SEO > Order
 * emails); the domain is always the store's own address. On a free address
 * (such as *.vercel.app) email can't be verified, so it falls back to the
 * EMAIL_FROM env var, then Resend's test sender (which only delivers to the
 * Resend account owner's own email).
 */
export function fromHeader(identity: IdentitySettings, siteUrl: string): string {
  const { domain } = sendingDomain(siteUrl);
  const user = senderLocalPart(identity.emailFromAddress);
  const envAddress = process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ?? process.env.EMAIL_FROM;
  const address = domain && user ? `${user}@${domain}` : envAddress?.trim() || "onboarding@resend.dev";
  const name = identity.storeName.replace(/["<>\r\n]/g, "").trim() || "Store";
  return `"${name}" <${address}>`;
}

/** Link in emails that opens the order on any device (falls back to the order page). */
export function orderLink(siteUrl: string, orderNumber: number): string {
  const token = orderLinkToken(orderNumber);
  return token
    ? `${siteUrl}/orders/${orderNumber}/open?t=${token}`
    : `${siteUrl}/orders/${orderNumber}`;
}

const SUBJECTS: Record<OrderEmailKind, (n: number, store: string) => string> = {
  confirmed: (n, s) => `Order #${n} confirmed — ${s}`,
  shipped: (n, s) => `Order #${n} has shipped — ${s}`,
  delivered: (n, s) => `Order #${n} delivered — ${s}`,
  refunded: (n, s) => `Refund for order #${n} — ${s}`,
};

type SendOptions = {
  /** Refund emails: amount refunded this time (paise) and the refund's id. */
  refundAmount?: number;
  refundId?: string;
  /** Sent by an admin on purpose: skip the duplicate guard. */
  manual?: boolean;
};

/**
 * Email the customer about their order and record the outcome on the order
 * (emailsSent / emailError, shown in the admin). Automatic sends carry an
 * idempotency key so Resend drops duplicates within 24 hours.
 */
export async function sendOrderEmail(
  orderId: string,
  kind: OrderEmailKind,
  opts: SendOptions = {},
): Promise<void> {
  const resend = await getResend();
  if (!resend) throw new Error("Email isn't set up: add your Resend API key in Admin > Settings > Integrations.");
  if (!hasDatabase) return;

  const [order, settings] = await Promise.all([
    db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { select: { accentColor: true } } } } },
    }),
    getSettings(),
  ]);
  if (!order) return;
  // Never tell a customer their cancelled order is confirmed or on its way (a refund notice is fine).
  if (order.status === "CANCELLED" && kind !== "refunded") {
    if (opts.manual) throw new Error("This order is cancelled, so that email isn't sent.");
    return;
  }

  const { identity, theme, commerce } = settings;
  const siteUrl = siteBaseUrl(settings);
  // Product photos for the email: an uploaded picture, else the bottle in the perfume's colour.
  const items = order.items.map((i) => {
    const size = bottleSizeOf(i.size);
    const image = i.image?.startsWith("https://")
      ? i.image
      : size && i.product
        ? `${siteUrl}/email-bottles/${bottleAccent(i.product.accentColor)}/${size}.png`
        : null;
    return { ...i, image };
  });
  const element = OrderEmail({
    kind,
    order: { ...order, items },
    identity,
    theme,
    orderUrl: orderLink(siteUrl, order.number),
    siteUrl,
    deliveryEstimate: commerce.deliveryEstimate,
    returnWindowDays: commerce.returnWindowDays,
    refundAmount: opts.refundAmount ?? order.refundedAmount,
  });

  const baseKey = `order-${kind}/${order.id}${opts.refundId ? `/${opts.refundId}` : ""}`;
  const idempotencyKey = opts.manual ? `${baseKey}/manual-${Date.now()}` : baseKey;

  try {
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    const { error } = await resend.emails.send(
      {
        from: fromHeader(identity, siteUrl),
        to: order.email,
        ...(identity.contactEmail ? { replyTo: identity.contactEmail } : {}),
        subject: SUBJECTS[kind](order.number, identity.storeName),
        html,
        text,
      },
      { idempotencyKey },
    );
    if (error) throw new Error(error.message);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.order
      .update({ where: { id: order.id }, data: { emailError: `${kind}: ${message}`.slice(0, 300) } })
      .catch(() => {});
    throw err;
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      emailError: null,
      ...(order.emailsSent.includes(kind) ? {} : { emailsSent: { push: kind } }),
    },
  });
}

/**
 * Send an order email after the current response finishes, so a slow email
 * service never delays the customer. Must run inside a request (Route
 * Handler, Server Action or Server Component). Does nothing without a Resend key.
 */
export function queueOrderEmail(orderId: string, kind: OrderEmailKind, opts: SendOptions = {}): void {
  after(async () => {
    if (!(await isEmailEnabled())) return;
    await sendOrderEmail(orderId, kind, opts).catch((err) =>
      console.error(`Order ${orderId}: ${kind} email failed`, err),
    );
  });
}
