import { HeadingSkeleton, ListSkeleton, Sk, StatCardsSkeleton } from "@/components/admin/admin-skeletons";

/** Dashboard skeleton (also the fallback for any admin screen without its own). */
export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton />
      <StatCardsSkeleton />
      <Sk className="mt-8 h-6 w-40 rounded-md" />
      <ListSkeleton rows={5} thumb={false} className="mt-4" />
    </div>
  );
}
