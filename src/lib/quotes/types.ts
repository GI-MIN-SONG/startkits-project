import { calculateQuoteTotal } from "./amount";

export type QuoteItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  title: string;
  issueDate: string;
  validUntil: string;
  client: string;
  items: QuoteItem[];
};

// 기존 호출부(quote-document.tsx 등) 하위호환을 위한 wrapper.
// 실제 계산 로직은 amount.ts의 calculateQuoteTotal이 담당한다.
export function quoteTotal(quote: Quote) {
  return calculateQuoteTotal(quote.items);
}

function isQuoteItem(value: unknown): value is QuoteItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unitPrice === "number"
  );
}

export function isValidQuoteItem(value: unknown): value is QuoteItem {
  return isQuoteItem(value);
}

export function isValidQuote(value: unknown): value is Quote {
  if (!value || typeof value !== "object") return false;
  const quote = value as Record<string, unknown>;

  return (
    typeof quote.id === "string" &&
    typeof quote.title === "string" &&
    typeof quote.issueDate === "string" &&
    typeof quote.validUntil === "string" &&
    typeof quote.client === "string" &&
    Array.isArray(quote.items) &&
    quote.items.every(isQuoteItem)
  );
}
