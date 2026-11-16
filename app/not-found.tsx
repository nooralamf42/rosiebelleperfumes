import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BottlePhoto } from "@/components/product/bottle-photo";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <div className="mx-auto mb-6 h-48 opacity-90">
          <BottlePhoto size="6" accent="brand-tangerine" name="404" className="h-full" />
        </div>
        <p className="text-eyebrow">Evaporated</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">This page isn&apos;t in the apothecary</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          The link may have moved, or the oil may have sold out. Everything we currently bottle is one click away.
        </p>
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 rounded-full px-8")}>
          Browse the shop
        </Link>
      </div>
    </div>
  );
}
