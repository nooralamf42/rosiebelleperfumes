"use client";

import { motion } from "motion/react";

/** Slow botanical ticker, serif + sprig separators. */
export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-foreground/10 bg-primary py-4 text-primary-foreground">
      <motion.div
        className="flex w-max items-center whitespace-nowrap"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-7 font-heading text-xl tracking-wide sm:text-2xl">{item}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-amber" fill="currentColor" aria-hidden>
              <path d="M12 2c0 6-4 9-9 10 5 1 9 4 9 10 0-6 4-9 9-10-5-1-9-4-9-10Z" />
            </svg>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
