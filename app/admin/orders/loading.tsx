import { HeadingSkeleton, ListSkeleton } from "@/components/admin/admin-skeletons";

export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton />
      <ListSkeleton rows={9} thumb={false} className="mt-4 md:mt-6" />
    </div>
  );
}
