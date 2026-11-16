"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { BottlePhoto, bottleHeightRatio } from "./bottle-photo";
import type { BottleSize } from "@/lib/sizes";

const SETTLE_SECONDS = 1.1;

/**
 * The hero bottle on a product page, using the studio photo. It rises into
 * place with a gentle swing and the label (name, brand, place) fades in as it
 * settles. The bottle also tilts a little toward the pointer (or a finger
 * dragged across it), so it feels like an object rather
 * than a flat picture. Choosing another size lifts the current bottle away and
 * the new one rises into its place.
 */
export function BottleStage({ size, accent, name, brand }: { size: BottleSize; accent: string; name: string; brand: string }) {
  const reduce = useReducedMotion();
  const [labelFor, setLabelFor] = useState<string | null>(null);

  // pointer tilt, smoothed
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotY = useSpring(tx, { stiffness: 120, damping: 16 });
  const rotX = useSpring(ty, { stiffness: 120, damping: 16 });

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setLabelFor(size), SETTLE_SECONDS * 0.55 * 1000);
    return () => clearTimeout(t);
  }, [size, reduce]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tx.set(x * 34);
    ty.set(-y * 12);
  };
  const onLeave = () => {
    tx.set(0);
    ty.set(0);
  };

  return (
    <div
      className="relative h-full w-full touch-pan-y"
      style={{ perspective: 900 }}
      onPointerMove={onMove}
      onPointerDown={onMove}
      onPointerLeave={onLeave}
      onPointerUp={onLeave}
    >
      <AnimatePresence mode="popLayout" initial>
        <motion.div
          key={size}
          initial={reduce ? { opacity: 0 } : { y: "70%", opacity: 0, rotateY: -38 }}
          animate={{ y: 0, opacity: 1, rotateY: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "-120%", opacity: 0 }}
          transition={{ duration: SETTLE_SECONDS, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-end justify-center"
        >
          <motion.div
            className="relative flex items-end justify-center"
            style={{ height: `${(100 * bottleHeightRatio(size)).toFixed(1)}%`, rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }}
          >
            <BottlePhoto size={size} accent={accent} name={name} brand={brand} priority className="h-full" labelVisible={reduce ? true : labelFor === size} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
