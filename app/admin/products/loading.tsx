import { HeadingSkeleton, ListSkeleton } from "@/components/admin/admin-skeletons";

export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton action />
      <ListSkeleton rows={9} className="mt-4 md:mt-6" />
    </div>
  );
}
