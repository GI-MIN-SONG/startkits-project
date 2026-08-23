import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuoteDocument } from "@/components/quote/quote-document";
import { getQuoteResult } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "견적서",
  robots: { index: false, follow: false },
};

export default async function QuotePage({ params }: PageProps<"/quote/[id]">) {
  const { id } = await params;
  const result = await getQuoteResult(id);

  if (!result.ok) {
    // 존재하지 않음/비공개 견적서는 동일한 404 경험으로 처리한다.
    if (
      result.error.kind === "not_found" ||
      result.error.kind === "not_published"
    ) {
      notFound();
    }
    // invalid_data/upstream_unavailable/rate_limited는 error.tsx로 위임한다.
    throw new Error(result.error.message, { cause: result.error });
  }

  return (
    <div className="bg-muted/40 px-3 py-6 sm:px-6 sm:py-10">
      <QuoteDocument quote={result.data} />
    </div>
  );
}
