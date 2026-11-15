import { Markdown } from "./markdown";
import { Reveal } from "@/components/motion/reveal";
import { splitImageStyle } from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";

/*
 * Editorial layout for the About page. The page is still plain markdown the
 * owner edits in Admin → Pages; this just lays it out:
 *   - text before the first "## heading" is the intro (a lead paragraph),
 *     and an image there becomes the wide hero;
 *   - each "## heading" is a section; if it contains an image, the image sits
 *     beside the text and the sides alternate;
 *   - a section that is only a quote becomes a large pull quote.
 */

const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

type Section = { title: string | null; body: string; image: { src: string; alt: string } | null };

function takeImage(md: string): { body: string; image: Section["image"] } {
  const m = md.match(IMAGE_RE);
  if (!m) return { body: md.trim(), image: null };
  const src = splitImageStyle(m[2]).src;
  if (!src.startsWith("https://")) return { body: md.replace(m[0], "").trim(), image: null };
  return { body: md.replace(m[0], "").trim(), image: { src, alt: m[1] } };
}

function parse(content: string): Section[] {
  // Split on lines that start a "## " heading, keeping the heading text.
  const parts = content.split(/^##\s+/m);
  const sections: Section[] = [];
  parts.forEach((part, i) => {
    if (i === 0) {
      const { body, image } = takeImage(part);
      if (body || image) sections.push({ title: null, body, image });
      return;
    }
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const { body, image } = takeImage(nl === -1 ? "" : part.slice(nl + 1));
    sections.push({ title, body, image });
  });
  return sections;
}

function PhotoFrame({ image, tall = true }: { image: NonNullable<Section["image"]>; tall?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-muted shadow-soft ring-1 ring-foreground/10", tall ? "aspect-[4/5]" : "aspect-[16/9]")}>
      {/* Plain <img>: the owner can paste an image from any https host. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
    </div>
  );
}

export function EditorialPage({ title, content, updatedLabel }: { title: string; content: string; updatedLabel?: string }) {
  const sections = parse(content);
  const intro = sections[0] && sections[0].title === null ? sections[0] : null;
  const rest = intro ? sections.slice(1) : sections;
  // Index only the sections that have a photo, so the sides alternate nicely.
  let photoIndex = 0;

  return (
    <div className="pb-8">
      {/* Intro */}
      <header className="container-page pt-12 sm:pt-20">
        <Reveal>
          <p className="text-eyebrow">About</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h1>
        </Reveal>
        {intro?.body && (
          <Reveal delay={0.1}>
            <div className="mt-8 max-w-2xl">
              <Markdown className="font-heading text-2xl leading-snug text-foreground/85 sm:text-3xl sm:leading-snug [&_p]:mt-0 [&_p]:leading-snug">{intro.body}</Markdown>
            </div>
          </Reveal>
        )}
        {intro?.image && (
          <Reveal delay={0.15} className="mt-12">
            <PhotoFrame image={intro.image} tall={false} />
          </Reveal>
        )}
      </header>

      {/* Sections */}
      <div className="mt-20 space-y-24 sm:space-y-32">
        {rest.map((s, i) => {
          const isQuote = !s.image && /^>\s?/.test(s.body.trim()) && s.body.trim().split("\n").every((l) => l.startsWith(">") || l.trim() === "");
          if (isQuote) {
            const quote = s.body.replace(/^>\s?/gm, "").trim();
            return (
              <section key={i} className="container-page">
                <Reveal className="mx-auto max-w-3xl text-center">
                  {s.title && <p className="text-eyebrow">{s.title}</p>}
                  <blockquote className="mt-6 font-heading text-3xl leading-snug sm:text-5xl sm:leading-[1.15]">
                    <span className="font-display-italic text-amber">“</span>
                    {quote}
                    <span className="font-display-italic text-amber">”</span>
                  </blockquote>
                </Reveal>
              </section>
            );
          }

          if (s.image) {
            const flip = photoIndex++ % 2 === 1;
            return (
              <section key={i} className="container-page">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                  <Reveal className={cn(flip && "lg:order-2")}>
                    <PhotoFrame image={s.image} />
                  </Reveal>
                  <Reveal delay={0.1} className={cn("max-w-lg", flip && "lg:order-1 lg:justify-self-end")}>
                    <p className="text-eyebrow">{String(i + 1).padStart(2, "0")}</p>
                    <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">{s.title}</h2>
                    <div className="mt-6">
                      <Markdown className="text-lg text-foreground/80">{s.body}</Markdown>
                    </div>
                  </Reveal>
                </div>
              </section>
            );
          }

          return (
            <section key={i} className="container-page">
              <Reveal className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl">{s.title}</h2>
                <div className="mt-6">
                  <Markdown className="text-lg text-foreground/80">{s.body}</Markdown>
                </div>
              </Reveal>
            </section>
          );
        })}
      </div>

      {updatedLabel && <p className="container-page mt-20 text-center text-xs text-muted-foreground">Last updated {updatedLabel}</p>}
    </div>
  );
}
