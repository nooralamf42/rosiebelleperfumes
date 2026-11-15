import { HeadingSkeleton, ListSkeleton } from "@/components/admin/admin-skeletons";

export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton action />
      <ListSkeleton rows={7} thumb={false} className="mt-4 md:mt-6" />
    </div>
  );
}
