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
 * otherwise a stacked wordmark. The first word is set large in the display
 * serif (mixed case); the rest of the name sits underneath in small caps,
 * letter-spaced out to exactly the width of the main word so the two lines
 * read as one block, the way fragrance houses lock up long names.
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
    <span className={cn("inline-flex flex-col items-stretch leading-none", className)} aria-label={name}>
      <span
        aria-hidden
        className={cn(
          "text-center font-heading font-normal tracking-[0.01em]",
          size === "lg" ? "text-5xl sm:text-6xl" : "text-[2rem] sm:text-[2.2rem]",
        )}
      >
        {main}
      </span>
      {sub && (
        <span
          aria-hidden
          className={cn(
            "flex w-full justify-between font-body font-medium uppercase text-foreground/80",
            size === "lg" ? "mt-2 text-[12px]" : "mt-[3px] text-[9px] sm:text-[10px]",
          )}
        >
          {Array.from(sub).map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      )}
    </span>
  );
}
