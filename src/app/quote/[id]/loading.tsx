import { Skeleton } from "@/components/ui/skeleton";

export default function QuoteLoading() {
  return (
    <div
      className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12"
      aria-label="견적서를 불러오는 중"
    >
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-12 w-3/4" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
