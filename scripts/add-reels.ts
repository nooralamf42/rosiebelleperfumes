/**
 * Turn a folder of your own reel videos into the homepage "Social reels".
 *
 *   npx tsx scripts/add-reels.ts <folder> [--handle=@rosiebelleperfume_1] [--append] [--dry-run]
 *
 * For every .mp4 / .mov / .webm / .m4v in the folder (newest first) it:
 *   1. compresses the video with ffmpeg (max 540 px wide, H.264, small file,
 *      sound kept, first 60 seconds), so the site stays light,
 *   2. uploads the small version to your Cloudinary (store/reels),
 *   3. saves it as a reel in Admin > Settings > Homepage > Social reels
 *      (replacing the current reels, or adding to them with --append).
 * --dry-run only compresses and shows the sizes: nothing is uploaded or saved.
 * Captions and post links can be added afterwards in the admin.
 */
import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const folder = args.find((a) => !a.startsWith("--"));
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const handle = flag("handle") ?? "@rosiebelleperfume_1";
const append = args.includes("--append");
const dryRun = args.includes("--dry-run");
const MAX_REELS = 12;
const EXT = /\.(mp4|mov|webm|m4v)$/i;

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function compress(input: string, output: string): void {
  const r = spawnSync(
    "ffmpeg",
    [
      "-y", "-v", "error", "-i", input,
      "-t", "60", // reels are short; cap at a minute
      "-vf", "scale='min(540,iw)':-2", // phone-frame size (about 270 px wide, so 540 is sharp even on retina); never upscale
      "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-maxrate", "750k", "-bufsize", "1500k", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "64k", "-ac", "2",
      "-map_metadata", "-1", // drop camera/location info
      "-movflags", "+faststart", // start playing before fully downloaded
      output,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  if (r.status !== 0) throw new Error(`ffmpeg failed on ${path.basename(input)}`);
}

async function main() {
  if (!folder) throw new Error("Usage: tsx scripts/add-reels.ts <folder> [--handle=@name] [--append] [--dry-run]");
  const dir = path.resolve(folder);
  if (!fs.existsSync(dir)) throw new Error(`Folder not found: ${dir}`);

  const files = fs
    .readdirSync(dir)
    .filter((f) => EXT.test(f))
    .map((f) => ({ f, full: path.join(dir, f), time: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time)
    .slice(0, MAX_REELS);
  if (files.length === 0) throw new Error(`No videos (.mp4 .mov .webm .m4v) found in ${dir}`);

  const work = fs.mkdtempSync(path.join(os.tmpdir(), "reels-"));
  const small: { name: string; file: string }[] = [];
  let before = 0, after = 0;
  for (const [i, v] of files.entries()) {
    const out = path.join(work, `reel-${i + 1}.mp4`);
    process.stdout.write(`Compressing ${v.f} ... `);
    compress(v.full, out);
    const a = fs.statSync(v.full).size, b = fs.statSync(out).size;
    before += a; after += b;
    console.log(`${mb(a)} → ${mb(b)}`);
    small.push({ name: v.f, file: out });
  }
  console.log(`\n${files.length} video(s): ${mb(before)} → ${mb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`);
  if (dryRun) {
    console.log(`Dry run: nothing uploaded. Compressed copies are in ${work}`);
    return;
  }

  const { cloudinary, cloudinaryEnabled } = await import("../lib/cloudinary");
  const { db } = await import("../lib/db");
  if (!cloudinaryEnabled) throw new Error("Cloudinary keys are missing in .env");

  const stamp = Date.now().toString(36);
  const items: { videoUrl: string; posterUrl: string; handle: string; caption: string; link: string }[] = [];
  for (const [i, s] of small.entries()) {
    const res = await cloudinary.uploader.upload(s.file, {
      resource_type: "video",
      folder: "store/reels",
      public_id: `reel-${stamp}-${i + 1}`,
      overwrite: false,
    });
    console.log(`Uploaded ${s.name} → ${res.secure_url}`);
    items.push({ videoUrl: res.secure_url, posterUrl: "", handle, caption: "", link: "" });
  }

  const row = await db.siteSetting.findUnique({ where: { key: "homepage" } });
  const data = (row?.data ?? {}) as { reels?: { items?: unknown[] } & Record<string, unknown> };
  const reels = data.reels ?? {};
  const existing = append && Array.isArray(reels.items) ? reels.items : [];
  const next = { ...data, reels: { ...reels, items: [...existing, ...items].slice(0, MAX_REELS) } };
  await db.siteSetting.upsert({ where: { key: "homepage" }, update: { data: next as object }, create: { key: "homepage", data: next as object } });
  console.log(`\nSaved ${items.length} reel(s)${append ? " (added to the existing ones)" : " (replacing the old ones)"}. Add captions and post links in Admin > Settings > Homepage > Social reels.`);
  await db.$disconnect();
  fs.rmSync(work, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
