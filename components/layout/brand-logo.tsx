import { cn } from "@/lib/utils";

/**
 * Store brand lockup: the uploaded logo when set (Admin → Settings → Store),
 * otherwise a monogram of the store name's first letter plus the name.
 * Uses <img>, not next/image, so logos from any https host work without
 * editing next.config's remotePatterns.
 */
export function BrandLogo({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={name} className={cn("h-9 w-auto max-w-[240px] object-contain", className)} />
    );
  }

  return (
    <span className={cn("font-heading text-xl font-normal uppercase tracking-[0.3em]", className)}>
      {name}
    </span>
  );
}
