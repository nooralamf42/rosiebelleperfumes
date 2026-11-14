import crypto from "node:crypto";

/*
 * Encrypts secrets (payment/shipping keys entered in the admin) before they
 * are stored in the database, so a database leak or backup doesn't expose
 * them. AES-256-GCM; the key is derived from INTEGRATIONS_SECRET, or from
 * CLERK_SECRET_KEY if that isn't set (every deployment with sign-in has it).
 * Changing that secret makes stored values undecryptable — they then count as
 * "not set" and must be entered again.
 */

function key(): Buffer | null {
  const seed = process.env.INTEGRATIONS_SECRET || process.env.CLERK_SECRET_KEY;
  if (!seed) return null;
  return crypto.createHash("sha256").update(`integrations-v1|${seed}`).digest();
}

/** Whether secrets can be stored on this deployment. */
export function canEncryptSecrets(): boolean {
  return key() !== null;
}

export function encryptSecret(plain: string): string {
  const k = key();
  if (!k) throw new Error("No server secret is configured to encrypt with.");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(":");
}

/** The original text, or null if it can't be decrypted (wrong key or corrupted). */
export function decryptSecret(stored: string): string | null {
  const k = key();
  if (!k) return null;
  const [version, iv, tag, data] = stored.split(":");
  if (version !== "v1" || !iv || !tag || !data) return null;
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", k, Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
