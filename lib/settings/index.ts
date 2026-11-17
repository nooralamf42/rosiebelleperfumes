import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { defaultSettings, settingsFromRows } from "./parse";
import type { CommerceRules, SiteSettings } from "./schema";

const loadSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    if (!hasDatabase) return defaultSettings();
    return settingsFromRows(await db.siteSetting.findMany());
  },
  ["site-settings:v1"],
  // revalidate: safety net for writes made outside Next (seed script);
  // admin saves invalidate immediately via updateTag(CACHE_TAGS.settings).
  { tags: [CACHE_TAGS.settings], revalidate: 3600 },
);

/**
 * All store settings. Cached across requests (invalidated on admin save) and
 * deduped within a request, since the layout, metadata and page all read it.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await loadSettings();
  } catch (err) {
    console.error("Failed to load site settings; using defaults", err);
    return defaultSettings();
  }
});

/**
 * Public base URL of the store, found automatically (nobody has to type it):
 * 1. NEXT_PUBLIC_APP_URL, if it was set on purpose (placeholders are ignored);
 * 2. the production domain Vercel exposes to every project (it is the custom
 *    domain once one is attached, else the *.vercel.app address);
 * 3. an address saved in Settings by an older version (no longer asked for);
 * 4. localhost, for local development. No trailing slash.
 */
export function siteBaseUrl(settings: SiteSettings): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  const usableEnv = fromEnv && !/your-?domain|example\.(com|org)/i.test(fromEnv) ? fromEnv : "";
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  return usableEnv || vercel || settings.identity.siteUrl || "http://localhost:3000";
}

export function toCommerceRules(settings: SiteSettings): CommerceRules {
  const { shippingFee, freeShippingEnabled, freeShippingThreshold, tiers } = settings.commerce;
  return { shippingFee, freeShippingEnabled, freeShippingThreshold, tiers };
}

export async function getCommerceRules(): Promise<CommerceRules> {
  return toCommerceRules(await getSettings());
}
