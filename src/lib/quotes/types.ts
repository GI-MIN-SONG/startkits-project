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
  // D-05 확정: Notion "총 금액"과 라인 아이템 합산이 불일치할 때만 채워지는
  // 경고용 필드. 화면 표시 총액은 계속 calculateQuoteTotal(items)를 사용한다.
  totalMismatch?: { declared: number; calculated: number };
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
