import { FormCardSkeleton, HeadingSkeleton, Sk } from "@/components/admin/admin-skeletons";

export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton />
      <div className="mt-6 space-y-5">
        <FormCardSkeleton fields={4} />
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <Sk className="h-6 w-32 rounded-md" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2].map((i) => (
              <Sk key={i} className="size-24 rounded-xl" />
            ))}
          </div>
        </div>
        <FormCardSkeleton fields={3} />
      </div>
    </div>
  );
}
