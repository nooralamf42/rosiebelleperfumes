import crypto from "crypto";
import Razorpay from "razorpay";
import { getIntegrations, type RazorpayCredentials } from "./integrations";

const clients = new Map<string, Razorpay>();

/** The Razorpay client and keys, or null when payments are off (no keys set). */
export async function getRazorpay(): Promise<
  (RazorpayCredentials & { client: Razorpay }) | null
> {
  const { razorpay } = await getIntegrations();
  if (!razorpay) return null;
  const id = `${razorpay.keyId}|${razorpay.keySecret}`;
  let client = clients.get(id);
  if (!client) {
    client = new Razorpay({ key_id: razorpay.keyId, key_secret: razorpay.keySecret });
    clients.set(id, client);
  }
  return { ...razorpay, client };
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Verify the signature returned by Razorpay Checkout on success. */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
  keySecret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Verify a Razorpay webhook signature. */
export function verifyWebhookSignature(body: string, signature: string, webhookSecret: string): boolean {
  if (!webhookSecret) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return safeEqual(expected, signature);
}
