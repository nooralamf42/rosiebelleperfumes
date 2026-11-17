/**
 * Minimal Shiprocket API client. Auth token is fetched on demand and cached
 * in-memory for its ~10 day lifetime (re-fetched on expiry).
 */
import { getIntegrations } from "./integrations";

/** True when Shiprocket credentials are set (Settings → Integrations, or env). */
export async function isShiprocketEnabled(): Promise<boolean> {
  return Boolean((await getIntegrations()).shiprocket);
}

const BASE = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expires: number; account: string } | null = null;

async function getCredentials() {
  const { shiprocket } = await getIntegrations();
  if (!shiprocket) throw new Error("Shiprocket isn't set up. Add it in Settings → Integrations.");
  return shiprocket;
}

async function getToken(): Promise<string> {
  const creds = await getCredentials();
  const account = `${creds.email}|${creds.password}`;
  if (cachedToken && cachedToken.account === account && cachedToken.expires > Date.now()) {
    return cachedToken.token;
  }

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: creds.email,
      password: creds.password,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Shiprocket auth failed (${res.status}). ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { token: string };
  // Token valid ~10 days; cache for 9 to be safe.
  cachedToken = { token: data.token, expires: Date.now() + 9 * 24 * 60 * 60 * 1000, account };
  return data.token;
}

export type ShiprocketOrderInput = {
  orderNumber: number;
  createdAt: Date;
  ship: {
    name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    email: string;
  };
  items: { name: string; sku: string; quantity: number; price: number }[]; // price in paise
  subtotalPaise: number;
};

export type ShiprocketOrderResult = {
  shiprocketOrderId?: string;
  shipmentId?: string;
  status?: string;
};

/**
 * The pickup address name Shiprocket should use. Shiprocket only accepts the
 * exact nickname of an address saved in the seller's account (Settings > Pickup
 * Addresses), and the owner shouldn't have to know that: if the configured name
 * isn't one of them, the account's own address is used (a verified one first).
 */
async function resolvePickupLocation(token: string, configured: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}/settings/company/pickup`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return configured;
    const data = (await res.json()) as {
      data?: { shipping_address?: { pickup_location?: string; status?: number | string; phone_verified?: number | string }[] };
    };
    const list = (data.data?.shipping_address ?? []).filter((a) => a.pickup_location);
    if (list.length === 0) return configured;
    const exact = list.find((a) => a.pickup_location!.toLowerCase() === configured.trim().toLowerCase());
    if (exact) return exact.pickup_location!;
    const verified = list.find((a) => Number(a.status) === 2 || Number(a.phone_verified) === 1);
    return (verified ?? list[0]).pickup_location!;
  } catch {
    return configured;
  }
}

/** Create an order (adhoc) in Shiprocket. */
export async function createShiprocketOrder(
  input: ShiprocketOrderInput,
): Promise<ShiprocketOrderResult> {
  const token = await getToken();

  // Shiprocket wants "YYYY-MM-DD HH:mm" (India time), a first and a last name,
  // and the delivery address spelled out even when it is the billing address.
  const orderDate = new Date(input.createdAt.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ");
  const [firstName, ...rest] = input.ship.name.trim().split(/\s+/);
  const lastName = rest.join(" ");
  const line1 = input.ship.line1.trim();
  const line2 = (input.ship.line2 ?? "").trim();

  const payload = {
    order_id: String(input.orderNumber),
    order_date: orderDate,
    pickup_location: await resolvePickupLocation(token, (await getCredentials()).pickupLocation),
    billing_customer_name: firstName || input.ship.name,
    billing_last_name: lastName,
    billing_address: line1,
    billing_address_2: line2,
    billing_city: input.ship.city.trim(),
    billing_pincode: input.ship.pincode.trim(),
    billing_state: input.ship.state.trim(),
    billing_country: "India",
    billing_email: input.ship.email,
    billing_phone: input.ship.phone.replace(/\D/g, "").slice(-10),
    shipping_is_billing: true,
    shipping_customer_name: firstName || input.ship.name,
    shipping_last_name: lastName,
    shipping_address: line1,
    shipping_address_2: line2,
    shipping_city: input.ship.city.trim(),
    shipping_pincode: input.ship.pincode.trim(),
    shipping_state: input.ship.state.trim(),
    shipping_country: "India",
    shipping_email: input.ship.email,
    shipping_phone: input.ship.phone.replace(/\D/g, "").slice(-10),
    order_items: input.items.map((i) => ({
      name: i.name,
      sku: i.sku,
      units: i.quantity,
      selling_price: Math.round(i.price / 100),
    })),
    payment_method: "Prepaid",
    sub_total: Math.round(input.subtotalPaise / 100),
    length: 15,
    breadth: 15,
    height: 15,
    weight: 0.5,
  };

  const res = await fetch(`${BASE}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    // Shiprocket uses this wording when the *pickup* side is incomplete, not only the customer's address.
    const hint = /add billing\\?\/shipping address/i.test(text)
      ? ` In Shiprocket check Settings > Pickup Addresses: an address named "${payload.pickup_location}" must exist and be verified. Set that exact name in Settings > Integrations > Pickup location.`
      : "";
    throw new Error(`Shiprocket order failed: ${res.status} ${text}${hint}`);
  }

  const raw = await res.text();
  let data: { order_id?: number; shipment_id?: number; status?: string; message?: string };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Shiprocket returned an unreadable reply: ${raw.slice(0, 200)}`);
  }
  // Shiprocket can answer 200 with an error message and no order; never treat that as success.
  if (!data.order_id || !data.shipment_id) {
    throw new Error(`Shiprocket did not create the order: ${raw.slice(0, 300)}`);
  }

  return {
    shiprocketOrderId: data.order_id ? String(data.order_id) : undefined,
    shipmentId: data.shipment_id ? String(data.shipment_id) : undefined,
    status: data.status,
  };
}

export type AwbResult = {
  awbCode?: string;
  courierName?: string;
};

/**
 * Auto-assign the best available courier and AWB number for a shipment.
 * Shiprocket picks the courier automatically when no `courier_id` is passed.
 */
export async function assignAwb(shipmentId: string): Promise<AwbResult> {
  const token = await getToken();

  const res = await fetch(`${BASE}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: Number(shipmentId) }),
  });

  const text = await res.text();
  // An empty wallet is by far the most common reason a courier can't be booked.
  if (/wallet|balance|recharge/i.test(text) && !/awb_code"\s*:\s*"?\d/.test(text)) {
    throw new Error(
      "Shiprocket couldn't book a courier: your Shiprocket wallet balance is too low. Recharge it in Shiprocket (Billing > Wallet), then press Retry.",
    );
  }
  if (!res.ok) {
    throw new Error(`Shiprocket AWB assignment failed: ${res.status} ${text.slice(0, 200)}`);
  }

  let data: { response?: { data?: { awb_code?: string; courier_name?: string } } };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Shiprocket AWB assignment returned invalid response: ${text.slice(0, 200)}`);
  }

  const awb = data.response?.data;
  if (!awb?.awb_code) {
    throw new Error(`Shiprocket AWB assignment did not return an AWB: ${text.slice(0, 200)}`);
  }

  return { awbCode: String(awb.awb_code), courierName: awb.courier_name };
}

/** Generate the printable shipping label PDF for an assigned shipment. */
export async function generateLabel(shipmentId: string): Promise<string> {
  const token = await getToken();

  const res = await fetch(`${BASE}/courier/generate/label`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [Number(shipmentId)] }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Shiprocket label generation failed: ${res.status} ${text.slice(0, 200)}`);
  }

  let data: { label_created?: number; label_url?: string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Shiprocket label generation returned invalid response: ${text.slice(0, 200)}`);
  }

  if (!data.label_url) {
    throw new Error(`Shiprocket did not return a label URL: ${text.slice(0, 200)}`);
  }

  return data.label_url;
}

/** Shiprocket's public consumer tracking page for an AWB. */
export function trackingUrlFor(awbCode: string): string {
  return `https://shiprocket.co/tracking/${awbCode}`;
}

export type TrackingActivity = {
  date: string;
  status: string;
  location: string;
};

export type TrackingInfo = {
  currentStatus: string;
  pickupDate: string | null;
  deliveredDate: string | null;
  activities: TrackingActivity[];
};

/** Fetch real, live courier tracking status for an AWB. */
export async function trackShipment(awbCode: string): Promise<TrackingInfo> {
  const token = await getToken();

  const res = await fetch(`${BASE}/courier/track/awb/${awbCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shiprocket tracking failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    tracking_data?: {
      shipment_track?: {
        current_status?: string;
        pickup_date?: string;
        delivered_date?: string;
      }[];
      shipment_track_activities?: {
        date?: string;
        status?: string;
        activity?: string;
        location?: string;
      }[];
    };
  };

  const track = data.tracking_data?.shipment_track?.[0];
  const activities = data.tracking_data?.shipment_track_activities ?? [];

  return {
    currentStatus: track?.current_status ?? "",
    pickupDate: track?.pickup_date || null,
    deliveredDate: track?.delivered_date || null,
    activities: activities.map((a) => ({
      date: a.date ?? "",
      status: a.activity || a.status || "",
      location: a.location ?? "",
    })),
  };
}

/**
 * Cancel an order in Shiprocket (e.g. after a full refund before pickup).
 * Shiprocket rejects this once the shipment has been picked up.
 */
export async function cancelShiprocketOrder(shiprocketOrderId: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${BASE}/orders/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ids: [Number(shiprocketOrderId)] }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Shiprocket cancel failed: ${res.status} ${text.slice(0, 200)}`);
  }
}
