import { describe, expect, it } from "vitest";

import { normalizeQuantity, normalizeText } from "../normalize";

describe("normalizeText", () => {
  it("앞뒤 공백을 제거한다", () => {
    expect(normalizeText("  값  ")).toBe("값");
  });

  it("빈 문자열은 그대로 빈 문자열", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("normalizeQuantity", () => {
  it("정상 숫자는 그대로 통과한다", () => {
    expect(normalizeQuantity(3)).toBe(3);
    expect(normalizeQuantity(-2)).toBe(-2);
    expect(normalizeQuantity(1.5)).toBe(1.5);
    expect(normalizeQuantity(0)).toBe(0);
  });

  it("NaN/Infinity는 0으로 치환한다", () => {
    expect(normalizeQuantity(NaN)).toBe(0);
    expect(normalizeQuantity(Infinity)).toBe(0);
    expect(normalizeQuantity(-Infinity)).toBe(0);
  });
});
