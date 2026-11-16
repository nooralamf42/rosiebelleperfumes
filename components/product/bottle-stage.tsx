"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BottlePhoto, bottleHeightRatio } from "./bottle-photo";
import type { BottleSize } from "@/lib/sizes";

const SPIN_SECONDS = 1.7;

/**
 * The hero bottle on a product page. It slides up into place and turns a full
 * circle (a turntable); its label (name, brand, place) fades in as the front
 * comes round. Choosing another size lifts the current bottle away and the new
 * one rises into its place. Tapping the bottle spins it again.
 */
export function BottleStage({ size, accent, name, brand }: { size: BottleSize; accent: string; name: string; brand: string }) {
  const reduce = useReducedMotion();
  const [spin, setSpin] = useState(0);
  // The turn (size + spin count) whose label has already come round to the front.
  const [labelFor, setLabelFor] = useState<string | null>(null);
  const turn = `${size}-${spin}`;

  // Hide the label at the start of every turn and bring it back as the front returns.
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setLabelFor(turn), SPIN_SECONDS * 0.62 * 1000);
    return () => clearTimeout(t);
  }, [turn, reduce]);

  return (
    <div className="relative h-full w-full" style={{ perspective: 1100 }}>
      <AnimatePresence mode="popLayout" initial>
        <motion.div
          key={size}
          initial={reduce ? { opacity: 0 } : { y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-120%", opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-end justify-center"
        >
          <motion.button
            key={spin}
            type="button"
            onClick={() => setSpin((n) => n + 1)}
            aria-label={`Spin the ${name} bottle`}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: reduce ? 0 : 360 }}
            transition={{ duration: SPIN_SECONDS, ease: [0.25, 0.7, 0.2, 1] }}
            className="flex cursor-pointer items-end justify-center"
            style={{ height: `${(100 * bottleHeightRatio(size)).toFixed(1)}%`, transformStyle: "preserve-3d" }}
          >
            <BottlePhoto size={size} accent={accent} name={name} brand={brand} priority className="h-full" labelVisible={reduce ? true : labelFor === turn} />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
