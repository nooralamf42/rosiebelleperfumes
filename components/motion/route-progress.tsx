"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "@/components/providers/smooth-scroll-provider";

/*
 * Instant feedback for every internal link.
 *
 * On slow connections Next.js may not have prefetched a page's loading
 * skeleton by the time you tap, so the old page just sits there until the
 * server answers. This listens for taps on internal links (capture phase,
 * before Next handles them) and shows a thin progress bar across the top
 * immediately. It finishes on its own once the URL changes, so it needs no
 * per-link wiring and also covers filters, pills and the footer.
 */

const keyOf = (pathname: string, search: string) => {
  const q = new URLSearchParams(search).toString();
  return q ? `${pathname}?${q}` : pathname;
};

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const here = keyOf(pathname, searchParams.toString());

  // The URL we left when a link was tapped. The bar is "on" for as long as the
  // current URL still equals it, i.e. until the navigation lands.
  const [leftFrom, setLeftFrom] = useState<string | null>(null);
  const active = leftFrom !== null && leftFrom === here;

  // Set when a link was tapped that should land at the top of the new page.
  // Back/forward and links that opt out (data-no-scroll, #hash) leave it false.
  const scrollOnArrive = useRef(false);
  const { scrollToTop } = useLenis();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.getAttribute("href")) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const target = keyOf(url.pathname, url.search);
      const current = keyOf(window.location.pathname, window.location.search);
      if (target === current) return; // same page or hash-only link
      scrollOnArrive.current = !url.hash && !a.closest("[data-no-scroll]");
      setLeftFrom(current);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The new URL has arrived: start the page at its top, even if the old one was scrolled down.
  useEffect(() => {
    if (!scrollOnArrive.current) return;
    scrollOnArrive.current = false;
    scrollToTop();
    // Once more after paint, in case the page swap moved things.
    const raf = requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
    return () => cancelAnimationFrame(raf);
  }, [here, scrollToTop]);

  // Safety net: never leave the bar running if a navigation is cancelled.
  useEffect(() => {
    if (leftFrom === null) return;
    const t = setTimeout(() => setLeftFrom(null), 15000);
    return () => clearTimeout(t);
  }, [leftFrom]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={leftFrom}
          data-route-progress
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[150] h-[3px]"
        >
          <motion.div
            className="h-full rounded-r-full bg-gradient-to-r from-amber to-primary shadow-[0_0_10px_var(--amber)]"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "35%", "70%", "90%"] }}
            transition={{ duration: 10, times: [0, 0.08, 0.45, 1], ease: "easeOut" }}
            exit={{ width: "100%", opacity: 0, transition: { duration: 0.35 } }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
