"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { HomepageSettings } from "@/lib/settings/schema";

export function Faq({ content }: { content: HomepageSettings["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (content.items.length === 0) return null;

  return (
    <section id="faq" className="container-page py-20 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <p className="text-eyebrow">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">{content.title}</h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Everything we get asked about purity, safety and shipping. Still curious? Write to us any time.
          </p>
        </Reveal>

        <div className="divide-y divide-foreground/10 border-y border-foreground/10">
          {content.items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-heading text-lg sm:text-xl">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? "var(--primary)" : "transparent", color: isOpen ? "var(--primary-foreground)" : "var(--foreground)" }}
                    transition={{ duration: 0.3 }}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-foreground/15"
                  >
                    <Plus className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-7 text-base leading-relaxed text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
