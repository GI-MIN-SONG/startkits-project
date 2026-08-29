import { demoQuote } from "./demo";
import { ok, type QuoteResult } from "./errors";
import { fetchNotionQuote, fetchNotionQuoteList } from "./notion";
import type { Quote, QuoteListItem } from "./types";

// 단계 3: 라우트(page.tsx)가 QuoteErrorKind별로 직접 분기할 수 있도록
// QuoteResult<Quote>를 그대로 반환한다. Quote | null로 언랩하지 않는다.
export async function getQuoteResult(id: string): Promise<QuoteResult<Quote>> {
  if (id === "demo") return ok(demoQuote);

  return fetchNotionQuote(id);
}

// 관리자 목록 조회 단일 진입점. notion.ts를 페이지에서 직접 import하지 않는다.
export async function getQuoteListResult(): Promise<
  QuoteResult<QuoteListItem[]>
> {
  return fetchNotionQuoteList();
}

export type { Quote, QuoteItem, QuoteListItem } from "./types";
export { quoteTotal } from "./types";
export type { QuoteError, QuoteErrorKind, QuoteResult } from "./errors";
export { resolveErrorCopy } from "./error-copy";
export type { QuoteErrorCopy } from "./error-copy";
export { isExpired } from "./date";
