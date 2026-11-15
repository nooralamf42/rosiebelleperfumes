import { FormCardSkeleton, HeadingSkeleton, Sk } from "@/components/admin/admin-skeletons";

export default function Loading() {
  return (
    <div aria-busy>
      <HeadingSkeleton subtitle />
      <div className="mt-6 flex gap-2">
        {[24, 20, 28, 32, 28].map((w, i) => (
          <Sk key={i} className="h-9 rounded-full" style={{ width: w * 4 }} />
        ))}
      </div>
      <div className="mt-5 space-y-5">
        <FormCardSkeleton fields={3} />
        <FormCardSkeleton fields={4} />
      </div>
    </div>
  );
}
