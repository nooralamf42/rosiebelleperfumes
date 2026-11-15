import { HeadingSkeleton, Sk } from "@/components/admin/admin-skeletons";

export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton />
      <div className="mt-6 space-y-4">
        <Sk className="h-10 w-full rounded-xl" />
        <Sk className="h-10 w-2/3 rounded-xl" />
        <Sk className="h-12 w-full rounded-xl" />
        <Sk className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
