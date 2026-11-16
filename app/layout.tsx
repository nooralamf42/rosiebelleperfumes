import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkEnabled } from "@/lib/auth-config";
import { getStoreCategories } from "@/lib/categories";
import { getFooterPages } from "@/lib/pages";
import { getSettings, siteBaseUrl } from "@/lib/settings";
import { getIntegrationFlags } from "@/lib/integrations";
import { themeToCss } from "@/lib/settings/theme-css";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Preloader } from "@/components/motion/preloader";
import { RouteProgress } from "@/components/motion/route-progress";
import { Toaster } from "@/components/ui/sonner";

/*
 * Type: Fraunces (soft, slightly wonky serif) for display, Inter for body.
 * Inter is bundled in app/fonts so builds never depend on reaching Google;
 * Fraunces is fetched once at build time by next/font and self-hosted.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const { storeName, tagline, seoTitle, seoDescription, ogImageUrl, faviconUrl } =
    settings.identity;
  const title = seoTitle || (tagline ? `${storeName} — ${tagline}` : storeName);
  const description = seoDescription || tagline || undefined;

  return {
    title: { default: title, template: `%s · ${storeName}` },
    description,
    metadataBase: new URL(siteBaseUrl(settings)),
    openGraph: {
      title,
      description,
      siteName: storeName,
      type: "website",
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [categories, settings, footerPages, integrations] = await Promise.all([
    getStoreCategories(),
    getSettings(),
    getFooterPages(),
    getIntegrationFlags(),
  ]);
  const clientSettings = {
    identity: settings.identity,
    theme: settings.theme,
    commerce: settings.commerce,
    integrations,
  };
  const style =
    settings.theme.preset === "minimal"
      ? "minimal"
      : settings.theme.preset === "botanical"
        ? "botanical"
        : undefined;

  const tree = (
    <html
      lang="en"
      data-style={style}
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme colors from admin settings; values are validated hex (safe to inline). */}
        <style id="store-theme" dangerouslySetInnerHTML={{ __html: themeToCss(settings.theme) }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteSettingsProvider value={clientSettings}>
          <SmoothScrollProvider>
            <Preloader name={settings.identity.storeName} />
            <Suspense fallback={null}>
              <RouteProgress />
            </Suspense>
            <Navbar
              categories={categories}
              extraLinks={footerPages
                .filter((p) => p.slug === "about")
                .map((p) => ({ href: `/${p.slug}`, label: p.title }))}
            />
            <main className="flex-1">{children}</main>
            <Footer categories={categories} identity={settings.identity} pages={footerPages} />
            <CartDrawer />
          </SmoothScrollProvider>
        </SiteSettingsProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );

  // Only wrap in ClerkProvider when auth keys are present, so the site runs
  // in demo mode without them.
  return clerkEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
