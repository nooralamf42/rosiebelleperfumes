import { cache } from "react";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { db, hasDatabase } from "./db";
import { CACHE_TAGS } from "./cache-tags";
import { canEncryptSecrets, decryptSecret, encryptSecret } from "./secret-box";

/*
 * Razorpay (payments) and Shiprocket (shipping) are optional. Each is OFF
 * until its credentials exist, from Admin → Settings → Integrations (stored
 * encrypted in the database) or, as a fallback, from environment variables.
 * A value saved in Settings wins over the environment.
 *
 * Nothing here is public: use getIntegrationFlags() for what the storefront
 * may know (just "is it on").
 */

export const INTEGRATIONS_KEY = "integrations";

/** What's saved in the database. Secret fields hold encrypted text. */
export const storedIntegrationsSchema = z.object({
  razorpay: z
    .object({
      keyId: z.string().default(""),
      keySecret: z.string().default(""),
      webhookSecret: z.string().default(""),
    })
    .prefault({}),
  shiprocket: z
    .object({
      email: z.string().default(""),
      password: z.string().default(""),
      pickupLocation: z.string().default(""),
      webhookToken: z.string().default(""),
    })
    .prefault({}),
});
export type StoredIntegrations = z.infer<typeof storedIntegrationsSchema>;

export type RazorpayCredentials = { keyId: string; keySecret: string; webhookSecret: string };
export type ShiprocketCredentials = {
  email: string;
  password: string;
  pickupLocation: string;
  webhookToken: string;
};

export type Integrations = {
  /** null = payments are off. */
  razorpay: RazorpayCredentials | null;
  /** null = shipping integration is off. */
  shiprocket: ShiprocketCredentials | null;
};

export async function readStoredIntegrations(): Promise<StoredIntegrations> {
  const empty = storedIntegrationsSchema.parse({});
  if (!hasDatabase) return empty;
  try {
    const row = await db.siteSetting.findUnique({ where: { key: INTEGRATIONS_KEY } });
    const parsed = storedIntegrationsSchema.safeParse(row?.data ?? {});
    return parsed.success ? parsed.data : empty;
  } catch (err) {
    console.error("Could not read integrations; treating them as off unless set in the environment", err);
    return empty;
  }
}

const secret = (stored: string) => (stored ? (decryptSecret(stored) ?? "") : "");
const env = (name: string) => process.env[name]?.trim() ?? "";

/** Settings value first, then the environment. */
export function resolveIntegrations(stored: StoredIntegrations): Integrations {
  const r = stored.razorpay;
  const keyId = r.keyId || env("RAZORPAY_KEY_ID") || env("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  const keySecret = secret(r.keySecret) || env("RAZORPAY_KEY_SECRET");
  const webhookSecret = secret(r.webhookSecret) || env("RAZORPAY_WEBHOOK_SECRET");

  const s = stored.shiprocket;
  const email = s.email || env("SHIPROCKET_EMAIL");
  const password = secret(s.password) || env("SHIPROCKET_PASSWORD");
  const pickupLocation = s.pickupLocation || env("SHIPROCKET_PICKUP_LOCATION") || "Primary";
  const webhookToken = secret(s.webhookToken) || env("SHIPROCKET_WEBHOOK_TOKEN");

  return {
    razorpay: keyId && keySecret ? { keyId, keySecret, webhookSecret } : null,
    shiprocket: email && password ? { email, password, pickupLocation, webhookToken } : null,
  };
}

/** Credentials for server code. Read once per request. */
export const getIntegrations = cache(async (): Promise<Integrations> =>
  resolveIntegrations(await readStoredIntegrations()),
);

/** What the storefront and admin screens may know — never a secret. */
export type IntegrationFlags = { payments: boolean; shipping: boolean };

const loadFlags = unstable_cache(
  async (): Promise<IntegrationFlags> => {
    const { razorpay, shiprocket } = resolveIntegrations(await readStoredIntegrations());
    return { payments: Boolean(razorpay), shipping: Boolean(shiprocket) };
  },
  ["integration-flags:v1"],
  // Saving integrations calls updateTag(settings); the TTL is a safety net.
  { tags: [CACHE_TAGS.settings], revalidate: 3600 },
);

export async function getIntegrationFlags(): Promise<IntegrationFlags> {
  try {
    return await loadFlags();
  } catch (err) {
    console.error("getIntegrationFlags failed; falling back to environment only", err);
    const { razorpay, shiprocket } = resolveIntegrations(storedIntegrationsSchema.parse({}));
    return { payments: Boolean(razorpay), shipping: Boolean(shiprocket) };
  }
}

export type FieldStatus = { set: boolean; source: "settings" | "environment" | null };

/** For the admin screen: which fields are set and where from (no secret values). */
export async function getIntegrationsStatus() {
  const stored = await readStoredIntegrations();
  const field = (fromSettings: boolean, envName: string | string[]): FieldStatus => {
    if (fromSettings) return { set: true, source: "settings" };
    const names = Array.isArray(envName) ? envName : [envName];
    return names.some((n) => env(n)) ? { set: true, source: "environment" } : { set: false, source: null };
  };
  const r = stored.razorpay;
  const s = stored.shiprocket;
  const resolved = resolveIntegrations(stored);
  return {
    razorpay: {
      active: Boolean(resolved.razorpay),
      keyId: r.keyId || env("RAZORPAY_KEY_ID") || env("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
      keySecret: field(Boolean(secret(r.keySecret)), "RAZORPAY_KEY_SECRET"),
      webhookSecret: field(Boolean(secret(r.webhookSecret)), "RAZORPAY_WEBHOOK_SECRET"),
    },
    shiprocket: {
      active: Boolean(resolved.shiprocket),
      email: s.email || env("SHIPROCKET_EMAIL"),
      password: field(Boolean(secret(s.password)), "SHIPROCKET_PASSWORD"),
      pickupLocation: s.pickupLocation || env("SHIPROCKET_PICKUP_LOCATION"),
      webhookToken: field(Boolean(secret(s.webhookToken)), "SHIPROCKET_WEBHOOK_TOKEN"),
    },
  };
}
export type IntegrationsStatus = Awaited<ReturnType<typeof getIntegrationsStatus>>;

/* ---- Saving (used by the admin action; pure so it can be tested) ---- */

export type IntegrationName = "razorpay" | "shiprocket";

export const razorpayInputSchema = z.object({
  keyId: z
    .string()
    .trim()
    .max(100)
    .refine((v) => v === "" || /^rzp_(test|live)_[A-Za-z0-9]+$/.test(v), "Key ID looks like rzp_test_… or rzp_live_…"),
  keySecret: z.string().trim().max(200),
  webhookSecret: z.string().trim().max(200),
});

export const shiprocketInputSchema = z.object({
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email"),
  password: z.string().max(200),
  pickupLocation: z.string().trim().max(80),
  webhookToken: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || v.length >= 16, "Use at least 16 characters (a long random token)"),
});

export type RazorpayInput = z.infer<typeof razorpayInputSchema>;
export type ShiprocketInput = z.infer<typeof shiprocketInputSchema>;

/**
 * Apply one integration's form to what's stored. Plain fields are replaced
 * (empty clears them, falling back to the environment). A secret left empty
 * keeps the saved one; a new value is encrypted. `null` removes the integration.
 */
export function mergeIntegration(
  stored: StoredIntegrations,
  which: IntegrationName,
  input: RazorpayInput | ShiprocketInput | null,
): StoredIntegrations {
  const next: StoredIntegrations = structuredClone(stored);
  if (input === null) {
    const empty = storedIntegrationsSchema.parse({});
    if (which === "razorpay") next.razorpay = empty.razorpay;
    else next.shiprocket = empty.shiprocket;
    return next;
  }
  const keep = (newValue: string, old: string) => (newValue === "" ? old : encryptSecret(newValue));
  if (which === "razorpay") {
    const i = input as RazorpayInput;
    next.razorpay = {
      keyId: i.keyId,
      keySecret: keep(i.keySecret, stored.razorpay.keySecret),
      webhookSecret: keep(i.webhookSecret, stored.razorpay.webhookSecret),
    };
  } else {
    const i = input as ShiprocketInput;
    next.shiprocket = {
      email: i.email,
      password: keep(i.password, stored.shiprocket.password),
      pickupLocation: i.pickupLocation,
      webhookToken: keep(i.webhookToken, stored.shiprocket.webhookToken),
    };
  }
  return next;
}

export { canEncryptSecrets };
