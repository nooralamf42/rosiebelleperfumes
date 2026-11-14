import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Truck, Tag, Gift } from "lucide-react";
import type { CommerceRules, HomepageSettings } from "@/lib/settings/schema";

const GRID_COLS = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"];

/** One card per perk, generated from the same rules checkout uses. */
function perksFrom(rules: CommerceRules) {
  const perks: { icon: typeof Truck; minSubtotal: number; perk: string }[] = [];
  if (rules.freeShippingEnabled) {
    perks.push({ icon: Truck, minSubtotal: rules.freeShippingThreshold, perk: "Free shipping" });
  }
  const tiers = [...rules.tiers].sort((a, b) => a.minSubtotal - b.minSubtotal);
  tiers.forEach((t, i) => {
    const parts = [];
    if (t.discount > 0) parts.push(`${formatPrice(t.discount)} off`);
    if (t.freeShipping) parts.push(parts.length ? "free shipping" : "Free shipping");
    if (parts.length === 0) return;
    const icon = t.discount === 0 ? Truck : i === tiers.length - 1 && tiers.length > 1 ? Gift : Tag;
    perks.push({ icon, minSubtotal: t.minSubtotal, perk: parts.join(" + ") });
  });
  return perks.sort((a, b) => a.minSubtotal - b.minSubtotal).slice(0, 4);
}

export function BundlePromo({
  content,
  rules,
}: {
  content: HomepageSettings["promo"];
  rules: CommerceRules;
}) {
  const perks = perksFrom(rules);
  if (perks.length === 0) return null;

  return (
    <section className="container-page py-20 sm:py-28">
      <Reveal>
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
          <div className="animate-drift pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-amber/25 blur-3xl" />
          <div className="animate-drift pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-white/10 blur-3xl [animation-delay:-7s]" />
          <div className="relative">
            <p className="text-eyebrow text-primary-foreground/60">Perks</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl sm:text-4xl lg:text-5xl">{content.title}</h2>
            {content.subtitle && (
              <p className="mx-auto mt-4 max-w-md text-base text-primary-foreground/75">{content.subtitle}</p>
            )}

            <div className={cn("mx-auto mt-12 grid max-w-3xl gap-3", GRID_COLS[perks.length])}>
              {perks.map((t) => (
                <div
                  key={`${t.minSubtotal}-${t.perk}`}
                  className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10"
                >
                  <t.icon className="mx-auto size-5 text-amber" strokeWidth={1.6} />
                  <p className="mt-4 font-heading text-3xl">{formatPrice(t.minSubtotal)}+</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-primary-foreground/70">{t.perk}</p>
                </div>
              ))}
            </div>

            {content.cta.label && content.cta.href && (
              <Link
                href={content.cta.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-12 h-12 rounded-full bg-amber px-8 text-white hover:bg-amber/90",
                )}
              >
                {content.cta.label}
              </Link>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
