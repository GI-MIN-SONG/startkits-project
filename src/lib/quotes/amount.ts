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

export type QuoteTotalReconciliation = {
  matches: boolean;
  diff: number;
};

// D-05 확정: Notion "총 금액"(declaredTotal)과 라인 아이템 합산(calculatedTotal)을
// 비교해 불일치 여부만 알려준다. 화면 표시값은 calculatedTotal을 계속 사용하며,
// 이 함수의 결과로 발행을 차단하지 않는다(경고 용도).
export function reconcileQuoteTotal(
  declaredTotal: number,
  calculatedTotal: number
): QuoteTotalReconciliation {
  const diff = declaredTotal - calculatedTotal;
  return { matches: diff === 0, diff };
}
