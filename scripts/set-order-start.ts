/**
 * Make the next order number start at a bigger figure, so a new store's first
 * orders read #10001, #10002 ... instead of #1, #2 (the usual practice: Shopify
 * starts at #1001). Only moves the counter forward; existing orders keep their
 * numbers.
 *
 *   npx tsx scripts/set-order-start.ts            # next order becomes #10001
 *   npx tsx scripts/set-order-start.ts 5001       # next order becomes #5001
 */
import "dotenv/config";

async function main() {
  const { db } = await import("../lib/db");
  const first = Math.max(2, Math.floor(Number(process.argv[2]) || 10001));
  const [{ max }] = await db.$queryRaw<{ max: number | null }[]>`SELECT MAX("number")::int AS max FROM "Order"`;
  const [{ seq }] = await db.$queryRaw<{ seq: string }[]>`SELECT pg_get_serial_sequence('"Order"', 'number') AS seq`;
  if (!seq) throw new Error("Could not find the order number sequence");
  if ((max ?? 0) >= first) {
    console.log(`Highest order number is already #${max}; nothing to change.`);
  } else {
    await db.$queryRawUnsafe(`SELECT setval('${seq}', ${first - 1}, true)`);
    console.log(`Done. The next order will be #${first}. (Existing orders keep their numbers: highest is #${max ?? "none"}.)`);
  }
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
