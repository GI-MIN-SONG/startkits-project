import { Skeleton } from "@/components/ui/skeleton";

export default function AdminQuotesLoading() {
  return (
    <div className="space-y-6" aria-label="견적서 목록을 불러오는 중">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-72" />
    </div>
  );
}
