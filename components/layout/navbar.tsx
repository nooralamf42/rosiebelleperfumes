"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, ShoppingBag, Search } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useCart, useHydrated } from "@/store/cart";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { cartCount } from "@/lib/cart-totals";
import { clerkEnabled } from "@/lib/auth-config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

const CATEGORY_BLURBS: Record<string, string> = {
  "pure-oils": "Single botanicals",
  blends: "Ready to diffuse",
  "carrier-oils": "Cold-pressed bases",
  rituals: "Roll-ons & sets",
};

/**
 * Header: wordmark left, a compact primary nav in the middle (one "Shop"
 * item opens a collections panel on hover), actions right. Frosted once you
 * scroll; slides away on scroll-down and back on scroll-up.
 */
export function Navbar({
  categories = [],
  extraLinks = [],
}: {
  categories?: { name: string; slug: string }[];
  extraLinks?: NavLink[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(0);
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(lines) : 0;
  const { identity } = useSiteSettings();
  useLenisLock(mobileOpen);

  const primary: NavLink[] = [...extraLinks, { href: "/#story", label: "Our story" }, { href: "/track-order", label: "Track order" }].slice(0, 3);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const hide = y > 160 && y > lastY.current;
      setHidden(hide);
      lastY.current = y;
      // Sticky elements below the header (shop filter bar) follow this.
      document.documentElement.style.setProperty("--nav-offset", hide ? "0px" : "4rem");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--nav-offset");
    };
  }, []);

  const openShop = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  };
  const closeShop = () => {
    closeTimer.current = setTimeout(() => setShopOpen(false), 120);
  };

  const linkCls =
    "relative text-[13px] font-medium tracking-[0.02em] text-foreground/75 transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-amber after:transition-transform after:duration-300 hover:after:scale-x-100";

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: hidden && !mobileOpen && !shopOpen ? -90 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-[background,box-shadow,border-color] duration-500",
        scrolled || shopOpen ? "glass border-b border-foreground/10" : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-6">
        {/* left: mobile menu + brand */}
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2 rounded-full md:hidden" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 border-r-0 bg-background p-0">
              <SheetHeader className="border-b border-foreground/10 px-6 py-5">
                <SheetTitle className="font-heading text-2xl font-normal">{identity.storeName}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col px-6 py-4">
                <p className="text-eyebrow pb-2 pt-1">Shop</p>
                {[{ href: "/products", label: "All products" }, ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name }))].map((l, i) => (
                  <motion.div key={l.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, duration: 0.4 }}>
                    <Link href={l.href} onClick={() => setMobileOpen(false)} className="block border-b border-foreground/10 py-3.5 font-heading text-2xl">
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-6 flex flex-col gap-3">
                  {primary.map((l) => (
                    <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm text-foreground/75">
                      {l.label}
                    </Link>
                  ))}
                  {clerkEnabled && (
                    <SignedIn>
                      <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-sm text-foreground/75">
                        My orders
                      </Link>
                    </SignedIn>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" aria-label={`${identity.storeName} home`}>
            <BrandLogo
              name={identity.storeName}
              logoUrl={identity.logoUrl}
              className="whitespace-nowrap font-heading text-[1.55rem] tracking-[0.08em]"
            />
          </Link>
        </div>

        {/* center: compact primary nav */}
        <div className="hidden items-center gap-8 md:flex">
          <div onMouseEnter={openShop} onMouseLeave={closeShop} className="relative">
            <Link
              href="/products"
              aria-expanded={shopOpen}
              onFocus={openShop}
              onClick={() => setShopOpen(false)}
              className={cn(linkCls, "inline-flex items-center gap-1", (shopOpen || pathname.startsWith("/products")) && "text-foreground")}
            >
              Shop
              <ChevronDown className={cn("size-3.5 transition-transform duration-300", shopOpen && "rotate-180")} />
            </Link>
          </div>
          {primary.map((l) => (
            <Link key={l.label} href={l.href} className={cn(linkCls, pathname === l.href && "text-foreground")}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* right: actions */}
        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          <Link
            href="/products"
            aria-label="Search the apothecary"
            className="hidden size-9 place-items-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground sm:grid"
          >
            <Search className="size-[18px]" strokeWidth={1.7} />
          </Link>

          {clerkEnabled ? (
            <>
              <SignedIn>
                <Link href="/orders" className="hidden text-[13px] font-medium text-foreground/75 hover:text-foreground lg:block">
                  Orders
                </Link>
                <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hidden text-[13px] font-medium text-foreground/75 hover:text-foreground sm:block">Sign in</button>
                </SignInButton>
              </SignedOut>
            </>
          ) : (
            <Link href="/sign-in" className="hidden text-[13px] font-medium text-foreground/75 hover:text-foreground sm:block">
              Sign in
            </Link>
          )}

          <button
            onClick={openCart}
            aria-label={`Open bag, ${count} items`}
            className="relative ml-1 grid size-10 place-items-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="size-[18px]" strokeWidth={1.7} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-amber px-1 text-[10px] font-semibold text-white ring-2 ring-background"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Shop panel */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div
            key="shop-panel"
            onMouseEnter={openShop}
            onMouseLeave={closeShop}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-foreground/10 bg-background/95 shadow-soft backdrop-blur md:block"
          >
            <div className="container-page grid grid-cols-[1fr_2fr] gap-10 py-8">
              <div>
                <p className="text-eyebrow">Collections</p>
                <p className="mt-3 max-w-xs font-heading text-2xl leading-snug">
                  Every oil we bottle, from single botanicals to <span className="font-display-italic text-amber">ready-to-diffuse blends</span>.
                </p>
                <Link href="/products" onClick={() => setShopOpen(false)} className="mt-5 inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 text-xs uppercase tracking-[0.14em] hover:opacity-60">
                  Shop everything <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {categories.map((c, i) => (
                  <li key={c.slug}>
                    <Link
                      href={`/products?category=${c.slug}`}
                      onClick={() => setShopOpen(false)}
                      className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3.5 transition-colors hover:border-foreground/10 hover:bg-card"
                    >
                      <span>
                        <span className="block font-heading text-lg leading-tight">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{CATEGORY_BLURBS[c.slug] ?? `Collection 0${i + 1}`}</span>
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
