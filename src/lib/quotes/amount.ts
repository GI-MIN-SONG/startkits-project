import type { QuoteItem } from "./types";

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

// 라인 아이템 하나의 소계(수량 × 단가).
export function calculateLineSubtotal(item: QuoteItem): number {
  return item.quantity * item.unitPrice;
}

// 견적서 전체 라인 아이템 합산액. 화면에 표시하는 총액의 단일 진실 공급원이다.
export function calculateQuoteTotal(items: QuoteItem[]): number {
  return items.reduce((total, item) => total + calculateLineSubtotal(item), 0);
}

export function formatCurrencyKRW(amount: number): string {
  return currencyFormatter.format(amount);
}
