import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuoteDocument } from "@/components/quote/quote-document";
import { getQuote } from "@/lib/quotes";

export const metadata: Metadata = {
  title: "견적서",
  robots: { index: false, follow: false },
};

export default async function QuotePage({ params }: PageProps<"/quote/[id]">) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  return (
    <div className="bg-muted/40 px-3 py-6 sm:px-6 sm:py-10">
      <QuoteDocument quote={quote} />
    </div>
  );
}
