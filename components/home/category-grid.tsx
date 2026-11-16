import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { StoreCategory } from "@/lib/categories";

/*
 * Editorial photos per starter category. A category the owner adds later
 * falls back to the next unused photo, so the grid always looks finished.
 */
const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;
const PHOTOS: Record<string, { src: string; blurb: string }> = {
  "natural-oils": {
    src: unsplash("photo-1617897903246-719242758050"),
    blurb: "Sandalwood, rose, khus and saffron attars.",
  },
  oud: {
    src: unsplash("photo-1602928321679-560bb453f190"),
    blurb: "Pure oud from Assam, Cambodia, Laos and beyond.",
  },
  mukhallat: {
    src: unsplash("photo-1612817288484-6f916006741a"),
    blurb: "Blended attars: Kannauj, oud, Qaboos, sultania.",
  },
  musk: {
    src: unsplash("photo-1620916297397-a4a5402a3c6c"),
    blurb: "Himalayan, Siberian, Kashmiri and civet musk.",
  },
  absolutes: {
    src: unsplash("photo-1515377905703-c4788e51af15"),
    blurb: "Rose, jasmine, lotus, ambergris and more.",
  },
};
const FALLBACKS = Object.values(PHOTOS);

export function CategoryGrid({ categories }: { categories: StoreCategory[] }) {
  if (categories.length === 0) return null;
  const items = categories.slice(0, 5).map((c, i) => ({
    ...c,
    ...(PHOTOS[c.slug] ?? FALLBACKS[i % FALLBACKS.length]),
  }));

  return (
    <section id="collections" className="container-page py-20 sm:py-28">
      <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-eyebrow">Collections</p>
          <h2 className="mt-3 max-w-md text-3xl sm:text-4xl lg:text-5xl">
            Five ways into <span className="font-display-italic text-amber">the collection</span>
          </h2>
        </div>
        <Link
          href="/products"
          className="group inline-flex items-center gap-1.5 border-b border-foreground pb-1 text-xs uppercase tracking-[0.14em] transition-opacity hover:opacity-60"
        >
          Browse everything
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" amount={0.15}>
        {items.map((c, i) => (
          <StaggerItem key={c.slug} className={i % 2 === 1 ? "lg:translate-y-10" : ""}>
            <Link
              href={`/products?category=${c.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-muted shadow-soft ring-1 ring-foreground/10"
            >
              <Image
                src={c.src}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">0{i + 1}</p>
                <h3 className="mt-2 font-heading text-xl leading-tight xl:text-2xl">{c.name}</h3>
                <p className="mt-2 max-w-[24ch] text-sm text-white/80 opacity-0 transition-all duration-500 [transform:translateY(8px)] group-hover:opacity-100 group-hover:[transform:translateY(0)]">
                  {c.blurb}
                </p>
              </div>
              <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-all duration-500 group-hover:bg-white group-hover:text-foreground">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
