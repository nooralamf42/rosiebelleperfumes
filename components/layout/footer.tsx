import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { splitBrand } from "./brand-logo";
import type { IdentitySettings } from "@/lib/settings/schema";
import type { PageLink } from "@/lib/pages";

type Category = { name: string; slug: string };

const SOCIAL_LABELS: Record<keyof IdentitySettings["socials"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X",
};

/** wa.me needs the country code; assume India (+91) for a bare 10-digit number. */
function whatsappHref(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

export function Footer({
  categories = [],
  identity,
  pages = [],
}: {
  categories?: Category[];
  identity: IdentitySettings;
  pages?: PageLink[];
}) {
  const columns = [
    {
      title: "Shop",
      links: [
        { label: "All products", href: "/products" },
        ...categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` })),
      ],
    },
    {
      title: "Information",
      links: pages.length
        ? pages.map((p) => ({ label: p.title, href: `/${p.slug}` }))
        : [
            { label: "Reviews", href: "/#reviews" },
            { label: "FAQ", href: "/#faq" },
          ],
    },
    {
      title: "Support",
      links: [
        { label: "My orders", href: "/orders" },
        { label: "Track order", href: "/track-order" },
        { label: "FAQ", href: "/#faq" },
        { label: "Admin", href: "/admin" },
      ],
    },
  ];

  const wa = identity.whatsapp ? whatsappHref(identity.whatsapp) : null;
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter(
    (k) => identity.socials[k],
  );

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-foreground/10 bg-background">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label={`${identity.storeName} home`}>
            <BrandLogo name={identity.storeName} logoUrl={identity.logoUrl} size="lg" className="items-start" />
          </Link>
          {identity.tagline && (
            <p className="mt-4 max-w-xs font-heading text-lg leading-snug text-foreground/80">{identity.tagline}</p>
          )}

          <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
            {identity.contactEmail && (
              <li>
                <a href={`mailto:${identity.contactEmail}`} className="inline-flex items-center gap-2 hover:text-foreground">
                  <Mail className="size-3.5" /> {identity.contactEmail}
                </a>
              </li>
            )}
            {identity.contactPhone && (
              <li>
                <a href={`tel:${identity.contactPhone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-3.5" /> {identity.contactPhone}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              </li>
            )}
            {identity.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" /> <span>{identity.address}</span>
              </li>
            )}
          </ul>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((k) => (
                <a
                  key={k}
                  href={identity.socials[k]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {SOCIAL_LABELS[k]}
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-eyebrow">{col.title}</h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={`${col.title}-${l.href}`}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* giant wordmark */}
      <div className="container-page pointer-events-none select-none overflow-hidden" aria-hidden>
        <p className="translate-y-[18%] text-center font-heading text-[clamp(4rem,19vw,16rem)] leading-none tracking-[-0.02em] text-foreground/[0.06]">
          {splitBrand(identity.storeName).main}
        </p>
      </div>

      <div className="border-t border-foreground/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {identity.storeName}. All rights reserved.
          </p>
          {identity.footerNote && <span>{identity.footerNote}</span>}
        </div>
      </div>
    </footer>
  );
}
