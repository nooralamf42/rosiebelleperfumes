import { bottleSizeOf } from "@/lib/sizes";
import type { PackagingSettings } from "@/lib/settings/schema";

export type ParcelItem = { size: string | null; quantity: number };

export type Parcel = {
  /** cm */
  length: number;
  breadth: number;
  height: number;
  /** kg, rounded to 10 g */
  weightKg: number;
  /** How much room the order needs, in the seller's own "slots". */
  slots: number;
  /** Which box was chosen (0 = the smallest). */
  boxIndex: number;
};

/**
 * Parcel for an order, from the seller's packaging settings: every bottle
 * adds its weight and its slots; the smallest box with enough room is used;
 * the box's own packing weight is added. Orders bigger than the largest box
 * use the largest box (the seller can add bigger ones).
 */
export function computeParcel(items: ParcelItem[], cfg: PackagingSettings): Parcel {
  let grams = 0;
  let slots = 0;
  for (const item of items) {
    const key = bottleSizeOf(item.size);
    const spec = key === "3" ? cfg.sizes.s3 : key === "6" ? cfg.sizes.s6 : key === "12" ? cfg.sizes.s12 : cfg.sizes.other;
    grams += spec.weightG * item.quantity;
    slots += spec.slots * item.quantity;
  }
  const found = cfg.boxes.findIndex((b) => b.upToSlots >= slots);
  const boxIndex = found === -1 ? cfg.boxes.length - 1 : found;
  const box = cfg.boxes[boxIndex];
  const totalG = grams + box.packWeightG;
  return {
    length: box.length,
    breadth: box.breadth,
    height: box.height,
    weightKg: Math.max(0.01, Math.round(totalG / 10) / 100),
    slots,
    boxIndex,
  };
}
