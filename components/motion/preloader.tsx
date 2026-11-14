"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const KEY = "essentia:intro-seen";

/**
 * First-visit brand intro: a drop fills, the wordmark rises, the curtain
 * lifts. Shown once per browser session (skipped on reload and for users
 * who prefer reduced motion), ~1.5s total.
 */
export function Preloader({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    // Defer to the next frame so the first paint (and hydration) stay unblocked.
    const raf = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!show || !root.current) return;
    const el = root.current;
    document.documentElement.style.overflow = "hidden";

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setShow(false);
      },
    });

    tl.fromTo(".pl-drop", { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 0.7, ease: "power2.inOut" })
      .fromTo(".pl-fill", { attr: { y: 140 } }, { attr: { y: 36 }, duration: 0.9, ease: "power2.inOut" }, "<0.1")
      .fromTo(".pl-letter", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.04 }, "-=0.5")
      .fromTo(".pl-sub", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3")
      .to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut", delay: 0.25 })
      .to(".pl-inner", { yPercent: 40, duration: 0.9, ease: "expo.inOut" }, "<");

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[200] flex items-center justify-center bg-primary text-primary-foreground"
    >
      <div className="pl-inner flex flex-col items-center gap-6">
        <svg width="56" height="80" viewBox="0 0 100 150" fill="none" className="pl-drop">
          <defs>
            <clipPath id="pl-clip">
              <path d="M50 6C50 6 10 62 10 96a40 40 0 0 0 80 0C90 62 50 6 50 6Z" />
            </clipPath>
          </defs>
          <path
            d="M50 6C50 6 10 62 10 96a40 40 0 0 0 80 0C90 62 50 6 50 6Z"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
          <rect className="pl-fill" x="0" y="140" width="100" height="150" fill="var(--amber)" clipPath="url(#pl-clip)" />
        </svg>
        <p className="flex overflow-hidden font-heading text-4xl tracking-[0.18em] sm:text-5xl">
          {name
            .toUpperCase()
            .split("")
            .map((ch, i) => (
              <span key={i} className="pl-letter inline-block">
                {ch === " " ? " " : ch}
              </span>
            ))}
        </p>
        <p className="pl-sub text-[11px] uppercase tracking-[0.3em] text-primary-foreground/70">
          Pure botanicals, bottled
        </p>
      </div>
    </div>
  );
}
