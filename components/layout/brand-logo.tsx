import { cn } from "@/lib/utils";

/**
 * Splits a store name into a main word and a descriptor:
 * "Rosiebelle Perfumes" → { main: "Rosiebelle", sub: "Perfumes" }.
 * A one-word name has no descriptor.
 */
export function splitBrand(name: string): { main: string; sub: string } {
  const [main = name, ...rest] = name.trim().split(/\s+/);
  return { main, sub: rest.join(" ") };
}

/**
 * Store brand lockup: the uploaded logo when set (Admin → Settings → Store),
 * otherwise a stacked wordmark: the first word in the display serif (mixed
 * case) with the rest of the name as a small, widely spaced line beneath.
 * Uses <img>, not next/image, so logos from any https host work without
 * editing next.config's remotePatterns.
 */
export function BrandLogo({
  name,
  logoUrl,
  className,
  size = "md",
}: {
  name: string;
  logoUrl?: string;
  className?: string;
  size?: "md" | "lg";
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt={name} className={cn("h-9 w-auto max-w-[240px] object-contain", className)} />
    );
  }

  const { main, sub } = splitBrand(name);
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)} aria-label={name}>
      <span
        aria-hidden
        className={cn(
          "font-heading font-normal tracking-[0.01em]",
          size === "lg" ? "text-4xl sm:text-5xl" : "text-[1.65rem] sm:text-[1.85rem]",
        )}
      >
        {main}
      </span>
      {sub && (
        <span
          aria-hidden
          className={cn(
            "font-body uppercase text-foreground/70",
            size === "lg" ? "mt-2 text-[10px] tracking-[0.5em] pl-[0.5em]" : "mt-1 text-[8px] tracking-[0.42em] pl-[0.42em]",
          )}
        >
          {sub}
        </span>
      )}
    </span>
  );
}
