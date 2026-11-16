import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage, getPublishedPageList } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import { fillPageTokens } from "@/lib/page-tokens";
import { Markdown } from "@/components/content/markdown";
import { Reveal } from "@/components/motion/reveal";
import { EditorialPage } from "@/components/content/editorial-page";

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await getPublishedPageList();
  return pages.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPublishedPage(slug), getSettings()]);
  if (!page) return {};
  const description = page.seoDescription
    ? fillPageTokens(page.seoDescription, settings)
    : undefined;
  return {
    title: page.seoTitle ? fillPageTokens(page.seoTitle, settings) : page.title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.seoTitle || page.title, description },
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPublishedPage(slug), getSettings()]);
  if (!page) notFound();

  const updated = new Date(page.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // The About page gets the editorial layout (sections with photos beside the text).
  if (page.slug === "about") {
    return <EditorialPage title={page.title} content={fillPageTokens(page.content, settings)} updatedLabel={updated} />;
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <Reveal>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl">{page.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
        </Reveal>
        <div className="mt-8">
          <Markdown>{fillPageTokens(page.content, settings)}</Markdown>
        </div>
      </article>
    </div>
  );
}
