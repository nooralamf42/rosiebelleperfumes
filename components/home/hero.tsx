"use client";

import Link from "next/link";
import { primaryImage } from "@/lib/product-images";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown, Star } from "lucide-react";
import { SplitWords } from "@/components/motion/split-words";
import { Magnetic } from "@/components/motion/magnetic";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { optimizedVideoUrl } from "@/lib/video-url";
import type { StoreProduct } from "@/lib/types";
import type { HomepageSettings } from "@/lib/settings/schema";

const AromaScene = dynamic(() => import("@/components/three/aroma-scene").then((m) => m.AromaScene), {
  ssr: false,
});

const ease = [0.22, 1, 0.36, 1] as const;

/** Editorial still used until the owner uploads a hero video or product photos. */
const HERO_STILL =
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=80";

/**
 * Hero: oversized serif headline over floating glass droplets (Three.js),
 * with a tall arched photo frame that drifts on scroll.
 */
export function Hero({
  content,
  products = [],
}: {
  content: HomepageSettings["hero"];
  products?: StoreProduct[];
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImage = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const feature = products.find((p) => primaryImage(p));
  const video = content.videoUrl?.startsWith("https://") ? optimizedVideoUrl(content.videoUrl) : "";
  const still = (feature && primaryImage(feature)) || HERO_STILL;

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      {/* backdrop: soft gradients + glass droplets */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background">
        <AromaScene className="absolute inset-0 h-full w-full [&>canvas]:block [&>canvas]:size-full" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-page grid min-h-[calc(100svh-4rem)] items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-10">
        <motion.div style={{ y: yCopy, opacity: fade }} className="relative z-10 flex flex-col items-start">
          {content.badge && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/80 backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-amber" />
              {content.badge}
            </motion.p>
          )}

          <h1 className="mt-7 max-w-[14ch] text-[clamp(2.75rem,6.8vw,6.25rem)] leading-[0.98] tracking-[-0.02em]">
            <SplitWords text={content.headline} delay={0.15} />
            {content.highlight && (
              <>
                {" "}
                <SplitWords text={content.highlight} delay={0.45} italicLast />
              </>
            )}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease }}
            className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {content.subtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            {content.primaryCta.label && content.primaryCta.href && (
              <Magnetic>
                <Link
                  href={content.primaryCta.href}
                  className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-7 text-sm shadow-soft")}
                >
                  {content.primaryCta.label}
                </Link>
              </Magnetic>
            )}
            {content.secondaryCta.label && content.secondaryCta.href && (
              <Magnetic>
                <Link
                  href={content.secondaryCta.href}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "h-12 rounded-full border-foreground/15 bg-background/60 px-7 text-sm backdrop-blur hover:bg-background",
                  )}
                >
                  {content.secondaryCta.label}
                </Link>
              </Magnetic>
            )}
          </motion.div>

          {content.ratingText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="mt-8 flex items-center gap-3 text-xs text-muted-foreground"
            >
              <span className="flex gap-0.5 text-amber">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </span>
              {content.ratingText}
            </motion.div>
          )}
        </motion.div>

        {/* Arched media frame */}
        <motion.div
          style={{ y: yImage }}
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
          className="relative mx-auto w-full max-w-[460px] lg:justify-self-end"
        >
          <div className="relative aspect-[4/5.4] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-muted shadow-soft ring-1 ring-foreground/10">
            {video ? (
              <video
                src={video}
                poster={still}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.4, ease }}
              >
                <Image
                  src={still}
                  alt={feature?.name ?? "Amber bottle of essential oil"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover"
                />
              </motion.div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>

          {/* floating caption chip */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease }}
            className="glass absolute -left-4 bottom-10 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-soft sm:-left-10"
          >
            <span className="grid size-9 place-items-center rounded-full bg-amber/15 text-amber">
              <svg width="16" height="20" viewBox="0 0 100 150" fill="currentColor">
                <path d="M50 6C50 6 10 62 10 96a40 40 0 0 0 80 0C90 62 50 6 50 6Z" />
              </svg>
            </span>
            <div className="text-xs">
              <p className="font-medium">Amber glass, always</p>
              <p className="text-muted-foreground">UV-protected · orifice reducer</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#collections"
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground lg:flex"
      >
        Scroll
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ArrowDown className="size-3.5" />
        </motion.span>
      </motion.a>
    </section>
  );
}
