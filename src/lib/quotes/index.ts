import { demoQuote } from "./demo";
import { ok, type QuoteResult } from "./errors";
import { fetchNotionQuote } from "./notion";
import type { Quote } from "./types";

// 단계 3: 라우트(page.tsx)가 QuoteErrorKind별로 직접 분기할 수 있도록
// QuoteResult<Quote>를 그대로 반환한다. Quote | null로 언랩하지 않는다.
export async function getQuoteResult(id: string): Promise<QuoteResult<Quote>> {
  if (id === "demo") return ok(demoQuote);

  return fetchNotionQuote(id);
}

export type { Quote, QuoteItem } from "./types";
export { quoteTotal } from "./types";
export type { QuoteError, QuoteErrorKind, QuoteResult } from "./errors";
export { resolveErrorCopy } from "./error-copy";
export type { QuoteErrorCopy } from "./error-copy";
export { isExpired } from "./date";
