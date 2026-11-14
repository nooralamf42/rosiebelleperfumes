import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { FEATURE_ICON_COMPONENTS } from "@/components/feature-icons";
import type { HomepageSettings } from "@/lib/settings/schema";

export function Features({ content }: { content: HomepageSettings["features"] }) {
  if (content.items.length === 0) return null;
  return (
    <section id="story" className="container-page py-20 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        {content.eyebrow && <p className="text-eyebrow">{content.eyebrow}</p>}
        <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">{content.title}</h2>
      </Reveal>

      <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" amount={0.2}>
        {content.items.map((f, i) => {
          const Icon = FEATURE_ICON_COMPONENTS[f.icon];
          return (
            <StaggerItem key={`${f.title}-${i}`}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-soft">
                <span className="grid size-11 place-items-center rounded-full bg-primary/8 text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 font-heading text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
                <span className="absolute -right-6 -top-6 size-24 rounded-full bg-amber/10 transition-transform duration-700 group-hover:scale-[2.2]" />
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
