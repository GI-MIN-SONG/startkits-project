import { describe, expect, it } from "vitest";

import {
  calculateLineSubtotal,
  calculateQuoteTotal,
  formatCurrencyKRW,
} from "../amount";
import type { QuoteItem } from "../types";

function item(overrides: Partial<QuoteItem>): QuoteItem {
  return {
    id: "item-1",
    name: "품목",
    quantity: 1,
    unitPrice: 1000,
    ...overrides,
  };
}

describe("calculateLineSubtotal", () => {
  it("수량 × 단가를 계산한다", () => {
    expect(calculateLineSubtotal(item({ quantity: 3, unitPrice: 1000 }))).toBe(
      3000
    );
  });

  it("수량이 0이면 0", () => {
    expect(calculateLineSubtotal(item({ quantity: 0, unitPrice: 1000 }))).toBe(
      0
    );
  });

  it("음수 단가도 그대로 계산한다(정책적 clamp 없음)", () => {
    expect(calculateLineSubtotal(item({ quantity: 1, unitPrice: -500 }))).toBe(
      -500
    );
  });

  it("소수 수량도 그대로 계산한다", () => {
    expect(
      calculateLineSubtotal(item({ quantity: 0.5, unitPrice: 1000 }))
    ).toBe(500);
  });
});

describe("calculateQuoteTotal", () => {
  it("빈 배열이면 0", () => {
    expect(calculateQuoteTotal([])).toBe(0);
  });

  it("여러 항목을 합산한다", () => {
    const items = [
      item({ id: "1", quantity: 1, unitPrice: 1200000 }),
      item({ id: "2", quantity: 1, unitPrice: 1800000 }),
      item({ id: "3", quantity: 1, unitPrice: 2400000 }),
    ];
    expect(calculateQuoteTotal(items)).toBe(5400000);
  });

  it("중복 항목 ID가 있어도 각 항목을 독립적으로 합산한다", () => {
    const items = [
      item({ id: "dup", quantity: 1, unitPrice: 1000 }),
      item({ id: "dup", quantity: 1, unitPrice: 1000 }),
    ];
    expect(calculateQuoteTotal(items)).toBe(2000);
  });

  it("큰 금액에서도 정확히 합산한다", () => {
    const items = [
      item({ quantity: 1, unitPrice: Number.MAX_SAFE_INTEGER - 1 }),
    ];
    expect(calculateQuoteTotal(items)).toBe(Number.MAX_SAFE_INTEGER - 1);
  });
});

describe("formatCurrencyKRW", () => {
  it("KRW 통화 기호와 천단위 구분자를 적용한다", () => {
    expect(formatCurrencyKRW(5400000)).toBe("₩5,400,000");
  });

  it("0원도 포맷팅한다", () => {
    expect(formatCurrencyKRW(0)).toBe("₩0");
  });
});
