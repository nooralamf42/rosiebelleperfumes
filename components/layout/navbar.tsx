"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ShoppingBag, Search } from "lucide-react";
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

/**
 * Glass header: transparent over the hero, frosted once you scroll, slides
 * away when scrolling down and back when scrolling up. The bag count bumps
 * whenever a line is added.
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
  const lastY = useRef(0);
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(lines) : 0;
  const { identity } = useSiteSettings();
  useLenisLock(mobileOpen);

  const links: NavLink[] = [
    { href: "/products", label: "Shop all" },
    ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
    ...extraLinks,
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 160 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: hidden && !mobileOpen ? -90 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 w-full transition-[background,box-shadow,border-color] duration-500",
        scrolled ? "glass border-b border-foreground/10" : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-page grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* desktop links */}
        <div className="hidden items-center gap-6 whitespace-nowrap md:flex">
          {links.slice(0, 5).map((l) => {
            const active = pathname === l.href.split("?")[0] && (l.href.includes("?") ? false : true);
            return (
              <Link
                key={l.label}
                href={l.href}
                className={cn(
                  "group relative text-xs font-medium uppercase tracking-[0.14em] text-foreground/75 transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-amber transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            );
          })}
        </div>

        {/* mobile menu trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-full md:hidden" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-r-0 bg-background p-0">
            <SheetHeader className="border-b border-foreground/10 px-6 py-5">
              <SheetTitle className="font-heading text-2xl font-normal">{identity.storeName}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col px-6 py-4">
              {links.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-foreground/10 py-4 font-heading text-2xl"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              {clerkEnabled && (
                <SignedIn>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-foreground/10 py-4 font-heading text-2xl"
                  >
                    My orders
                  </Link>
                </SignedIn>
              )}
              <Link href="/track-order" onClick={() => setMobileOpen(false)} className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Track an order
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* brand */}
        <Link href="/" aria-label={`${identity.storeName} home`} className="justify-self-center">
          <BrandLogo
            name={identity.storeName}
            logoUrl={identity.logoUrl}
            className="whitespace-nowrap font-heading text-2xl tracking-[0.08em] sm:text-[1.7rem]"
          />
        </Link>

        {/* actions */}
        <div className="flex shrink-0 items-center justify-end gap-1 whitespace-nowrap sm:gap-2">
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
                <Link
                  href="/orders"
                  className="hidden text-xs font-medium uppercase tracking-[0.14em] text-foreground/75 hover:text-foreground lg:block"
                >
                  Orders
                </Link>
                <UserButton appearance={{ elements: { avatarBox: "size-7" } }} />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hidden text-xs font-medium uppercase tracking-[0.14em] text-foreground/75 hover:text-foreground sm:block">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="hidden text-xs font-medium uppercase tracking-[0.14em] text-foreground/75 hover:text-foreground sm:block"
            >
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
    </motion.header>
  );
}
