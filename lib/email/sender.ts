/*
 * Who order emails come from. The store owner only chooses the part before the
 * "@" (orders, hello, care...). The domain is always the store's own address,
 * because Resend only sends from a domain you have verified, and a free
 * address like mystore.vercel.app can never be verified.
 */

/** Free or shared addresses nobody can add DNS records to, so email can't be verified on them. */
const SHARED_HOSTS = [
  /\.vercel\.app$/,
  /\.netlify\.app$/,
  /\.github\.io$/,
  /\.pages\.dev$/,
  /\.workers\.dev$/,
  /\.onrender\.com$/,
  /\.herokuapp\.com$/,
  /\.railway\.app$/,
  /\.fly\.dev$/,
  /\.web\.app$/,
  /\.firebaseapp\.com$/,
  /\.ngrok(-free)?\.(app|dev|io)$/,
  /\.trycloudflare\.com$/,
  /\.localhost$/,
  /^localhost$/,
  /\.local$/,
  /^\d{1,3}(\.\d{1,3}){3}$/, // a bare IP address
];

export type SendingDomain = {
  /** The address the store is on, e.g. rosiebelleperfumes.in. Empty if the site address is unusable. */
  host: string;
  /** The domain emails can be sent from, or null when the address can't be used for email. */
  domain: string | null;
};

export function sendingDomain(siteUrl: string): SendingDomain {
  let host = "";
  try {
    host = new URL(siteUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { host: "", domain: null };
  }
  if (!host || !host.includes(".") || SHARED_HOSTS.some((re) => re.test(host))) return { host, domain: null };
  return { host, domain: host };
}

/** "orders@shop.com" → "orders"; a bare "orders" stays as it is. */
export function senderLocalPart(value: string): string {
  return value.trim().split("@")[0].replace(/[^A-Za-z0-9._+-]/g, "");
}
