import { demoQuote } from "./demo";
import { fetchNotionQuote } from "./notion";
import type { Quote } from "./types";

// fetchNotionQuote는 QuoteResult<Quote>를 반환하지만, 이번 단계에서는
// page.tsx/quote-document.tsx의 기존 Quote | null 계약을 유지하기 위해
// 여기서 어댑터 역할로 언랩한다. 세분화된 오류(QuoteErrorKind)를 라우트가
// 직접 분기하는 것은 단계 3 범위다.
export async function getQuote(id: string): Promise<Quote | null> {
  if (id === "demo") return demoQuote;

  const result = await fetchNotionQuote(id);
  return result.ok ? result.data : null;
}

export type { Quote, QuoteItem } from "./types";
export { quoteTotal } from "./types";
export type { QuoteError, QuoteErrorKind, QuoteResult } from "./errors";
