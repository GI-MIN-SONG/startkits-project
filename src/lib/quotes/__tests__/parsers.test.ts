import { describe, expect, it } from "vitest";

import {
  parseDate,
  parseFormulaNumber,
  parseNumber,
  parseRichText,
  parseStatusOption,
  parseTitle,
} from "../parsers";

describe("parseRichText / parseTitle", () => {
  it("title 배열의 plain_text를 이어 붙인다", () => {
    expect(
      parseTitle({ title: [{ plain_text: "가" }, { plain_text: "나" }] })
    ).toBe("가나");
  });

  it("rich_text 배열도 처리한다", () => {
    expect(parseRichText({ rich_text: [{ plain_text: "  값  " }] })).toBe("값");
  });

  it("값이 없으면 빈 문자열을 반환한다", () => {
    expect(parseRichText(undefined)).toBe("");
    expect(parseRichText({})).toBe("");
  });
});

describe("parseDate", () => {
  it("YYYY-MM-DD로 절삭한다", () => {
    expect(parseDate({ date: { start: "2026-08-01T00:00:00.000Z" } })).toBe(
      "2026-08-01"
    );
  });

  it("start가 없으면 빈 문자열", () => {
    expect(parseDate({ date: null })).toBe("");
    expect(parseDate(undefined)).toBe("");
  });
});

describe("parseNumber", () => {
  it("정상 숫자를 그대로 반환한다", () => {
    expect(parseNumber({ number: 1200000 })).toBe(1200000);
  });

  it("0/음수/소수도 그대로 반환한다", () => {
    expect(parseNumber({ number: 0 })).toBe(0);
    expect(parseNumber({ number: -5 })).toBe(-5);
    expect(parseNumber({ number: 1.5 })).toBe(1.5);
  });

  it("null/undefined면 0", () => {
    expect(parseNumber({ number: null })).toBe(0);
    expect(parseNumber(undefined)).toBe(0);
  });
});

describe("parseFormulaNumber", () => {
  it("formula 결과가 number 타입이면 값을 취한다", () => {
    expect(
      parseFormulaNumber({ formula: { type: "number", number: 4200000 } })
    ).toBe(4200000);
  });

  it("formula 결과가 다른 타입이면 0", () => {
    expect(parseFormulaNumber({ formula: { type: "string" } })).toBe(0);
    expect(parseFormulaNumber(undefined)).toBe(0);
  });
});

describe("parseStatusOption", () => {
  it("옵션 이름을 반환한다", () => {
    expect(parseStatusOption({ status: { name: "승인" } })).toBe("승인");
  });

  it("값이 없으면 빈 문자열", () => {
    expect(parseStatusOption({ status: null })).toBe("");
    expect(parseStatusOption(undefined)).toBe("");
  });
});
