"use client";

import { Button } from "@/components/ui/button";

export default function QuoteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">견적서를 불러오지 못했습니다</h1>
      <p className="mt-3 text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
      <Button className="mt-7" onClick={reset}>
        다시 시도
      </Button>
    </section>
  );
}
