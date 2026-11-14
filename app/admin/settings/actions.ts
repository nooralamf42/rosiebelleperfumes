"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db, hasDatabase } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { assertAdmin } from "@/lib/admin-guard";
import { settingsSchemas, type SettingsSection, type SiteSettings } from "@/lib/settings/schema";
import {
  INTEGRATIONS_KEY,
  canEncryptSecrets,
  getIntegrations,
  mergeIntegration,
  razorpayInputSchema,
  readStoredIntegrations,
  shiprocketInputSchema,
  type IntegrationName,
} from "@/lib/integrations";

export type SaveSettingsResult<K extends SettingsSection = SettingsSection> =
  | { ok: true; data: SiteSettings[K] }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Validate and store one settings section, then refresh every page that shows it. */
export async function saveSettingsSection<K extends SettingsSection>(
  section: K,
  input: unknown,
): Promise<SaveSettingsResult<K>> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can change settings." };
  }
  if (!hasDatabase) return { ok: false, error: "Connect a database to save settings." };

  const schema = settingsSchemas[section];
  if (!schema) return { ok: false, error: "Unknown settings section." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.map(String).join(".");
      fieldErrors[key] ??= issue.message;
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Some fields are invalid.",
      fieldErrors,
    };
  }

  try {
    const data = JSON.parse(JSON.stringify(parsed.data));
    await db.siteSetting.upsert({
      where: { key: section },
      update: { data },
      create: { key: section, data },
    });
  } catch (err) {
    console.error("Failed to save settings", err);
    return { ok: false, error: "Couldn't save — please try again." };
  }

  updateTag(CACHE_TAGS.settings);
  revalidatePath("/", "layout");
  return { ok: true, data: parsed.data as SiteSettings[K] };
}

/** Drop every cached storefront read — e.g. after a bulk product import. */
export async function refreshStoreCache(): Promise<{ ok: boolean; error?: string }> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can do this." };
  }
  for (const tag of Object.values(CACHE_TAGS)) updateTag(tag);
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---- Integrations (payments + shipping) ---- */

type IntegrationResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Save (or, with `fields: null`, remove) one integration's credentials. */
export async function saveIntegrationAction(
  which: IntegrationName,
  fields: Record<string, string> | null,
): Promise<IntegrationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can change integrations." };
  }
  if (!hasDatabase) return { ok: false, error: "Connect a database to save integrations." };

  let input = null;
  if (fields) {
    const schema = which === "razorpay" ? razorpayInputSchema : shiprocketInputSchema;
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the fields", fieldErrors };
    }
    input = parsed.data;
    const hasNewSecret = Object.entries(input).some(
      ([k, v]) => v && ["keySecret", "webhookSecret", "password", "webhookToken"].includes(k),
    );
    if (hasNewSecret && !canEncryptSecrets()) {
      return {
        ok: false,
        error: "Secrets can't be stored yet: set CLERK_SECRET_KEY (or INTEGRATIONS_SECRET) in your hosting environment.",
      };
    }
  }

  try {
    const next = mergeIntegration(await readStoredIntegrations(), which, input);
    const data = JSON.parse(JSON.stringify(next));
    await db.siteSetting.upsert({
      where: { key: INTEGRATIONS_KEY },
      update: { data },
      create: { key: INTEGRATIONS_KEY, data },
    });
  } catch (err) {
    console.error("Failed to save integration", err);
    return { ok: false, error: "Couldn't save — please try again." };
  }

  updateTag(CACHE_TAGS.settings);
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Try the saved credentials against the provider (read-only calls). */
export async function testIntegrationAction(which: IntegrationName): Promise<IntegrationResult> {
  try {
    await assertAdmin();
  } catch {
    return { ok: false, error: "Only admins can test integrations." };
  }
  const { razorpay, shiprocket } = await getIntegrations();
  try {
    if (which === "razorpay") {
      if (!razorpay) return { ok: false, error: "Save the Key ID and Key secret first." };
      const { getRazorpay } = await import("@/lib/razorpay");
      const gateway = await getRazorpay();
      await gateway!.client.orders.all({ count: 1 });
      return { ok: true };
    }
    if (!shiprocket) return { ok: false, error: "Save the email and password first." };
    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: shiprocket.email, password: shiprocket.password }),
    });
    if (!res.ok) return { ok: false, error: "Shiprocket rejected that email and password." };
    return { ok: true };
  } catch (err) {
    const message =
      (err as { error?: { description?: string } })?.error?.description ??
      (err instanceof Error ? err.message : "Connection failed");
    return { ok: false, error: message };
  }
}
