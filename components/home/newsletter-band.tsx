import { Reveal } from "@/components/motion/reveal";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBand() {
  return (
    <section className="container-page pb-8">
      <Reveal>
        <div className="grid items-center gap-8 rounded-[2rem] border border-foreground/10 bg-card px-8 py-12 sm:px-12 lg:grid-cols-2">
          <div>
            <p className="text-eyebrow">The dispatch</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              Seasonal blends, <span className="font-display-italic text-amber">before anyone else</span>
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              One letter a month: what we&apos;re distilling, how to use it, and 10% off your first order.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <NewsletterForm />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
