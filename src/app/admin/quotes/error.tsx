"use client";

import { Button } from "@/components/ui/button";
import { resolveErrorCopy } from "@/lib/quotes/error-copy";
import type { QuoteError } from "@/lib/quotes/errors";

export default function AdminQuotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const cause = error.cause as QuoteError | undefined;
  const copy = resolveErrorCopy(cause?.kind);

  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">{copy.title}</h1>
      <p className="mt-3 text-muted-foreground">{copy.description}</p>
      {copy.showRetry && (
        <Button className="mt-7" onClick={reset}>
          다시 시도
        </Button>
      )}
      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground/70">
          오류 코드: {error.digest}
        </p>
      )}
    </section>
  );
}
