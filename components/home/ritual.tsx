"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion/reveal";

/*
 * "The ritual": a sticky photo with three steps that take turns as you
 * scroll. Scroll position drives which step is lit, so it reads as a story
 * rather than a list.
 */
const STEPS = [
  {
    n: "01",
    title: "Choose your note",
    copy: "Start with a family you already love: sandalwood for calm, rose for romance, khus for cool, oud for depth. Try it in the 3 gm bottle first.",
    src: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80",
  },
  {
    n: "02",
    title: "Wear it your way",
    copy: "A small dab on the wrists, neck or clothing is plenty. These oils are concentrated, so start with a little and let it bloom on your skin.",
    src: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    n: "03",
    title: "Make it a practice",
    copy: "Same oil, every day. Within a week the scent becomes yours, and the people around you start to know you by it.",
    src: "https://images.unsplash.com/photo-1611073615830-9f76902c10fe?auto=format&fit=crop&w=1200&q=80",
  },
];

export function Ritual() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative border-y border-foreground/10 bg-primary text-primary-foreground">
      <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-0">
        {/* sticky media */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100svh-6rem)] lg:py-12">
          <Reveal className="relative h-[60vw] max-h-[520px] overflow-hidden rounded-[2rem] ring-1 ring-white/10 lg:h-full lg:max-h-none">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.06 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={s.src} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <p className="font-heading text-6xl text-white/90">{STEPS[active].n}</p>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${active === i ? "w-8 bg-amber" : "w-3 bg-white/40"}`}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* steps */}
        <div className="flex flex-col justify-center lg:py-32">
          <Reveal>
            <p className="text-eyebrow text-primary-foreground/60">The ritual</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
              Three steps to <span className="font-display-italic text-amber">a better evening</span>
            </h2>
          </Reveal>

          <div className="mt-12 flex flex-col">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                className="border-t border-white/10 py-10 transition-opacity duration-500 last:border-b lg:min-h-[45vh]"
                style={{ opacity: active === i ? 1 : 0.4 }}
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-heading text-sm text-amber">{s.n}</span>
                  <h3 className="font-heading text-2xl sm:text-3xl">{s.title}</h3>
                </div>
                <p className="mt-4 max-w-md pl-10 text-base leading-relaxed text-primary-foreground/75">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
