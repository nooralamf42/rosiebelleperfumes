import { Star } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { HomepageSettings } from "@/lib/settings/schema";
import type { HomepageReview } from "@/lib/products";

export function Testimonials({
  content,
  reviews,
}: {
  content: HomepageSettings["testimonials"];
  reviews: HomepageReview[];
}) {
  if (reviews.length === 0) return null;
  return (
    <section id="reviews" className="relative overflow-hidden bg-secondary/60 py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-20 top-10 font-heading text-[18rem] leading-none text-foreground/[0.035]" aria-hidden>
        “
      </div>
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center gap-1 text-amber">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl">{content.title}</h2>
          {content.subtitle && <p className="mt-3 text-muted-foreground">{content.subtitle}</p>}
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" amount={0.2}>
          {reviews.map((r, i) => (
            <StaggerItem key={i} className={i % 2 === 1 ? "sm:translate-y-6" : ""}>
              <figure className="flex h-full flex-col rounded-[1.75rem] bg-card p-7 shadow-soft ring-1 ring-foreground/5">
                <div className="flex gap-0.5 text-amber">
                  {[...Array(r.rating)].map((_, s) => (
                    <Star key={s} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 font-heading text-lg leading-snug text-foreground/90">
                  “{r.comment}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 text-xs">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 font-heading text-sm text-primary">
                    {r.author.charAt(0)}
                  </span>
                  <span className="font-medium uppercase tracking-[0.14em]">{r.author}</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
