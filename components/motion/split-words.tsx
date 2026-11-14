"use client";

import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";

/**
 * Word-by-word rise-in for headlines. Pure CSS transitions (see
 * .reveal-words in globals.css); JS only toggles the class once visible.
 */
export function SplitWords({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  italicLast = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Render the last word in the italic display cut. */
  italicLast?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cn("reveal-words", className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="word" aria-hidden>
          <span
            className={cn(italicLast && i === words.length - 1 && "font-display-italic text-amber")}
            style={{ transitionDelay: `${delay + i * stagger}s` }}
          >
            {w}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
