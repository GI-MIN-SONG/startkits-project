import { describe, expect, it } from "vitest";

import { formatDisplayDate, isExpired, parseDateString } from "../date";

describe("parseDateString", () => {
  it("정상 날짜 문자열을 Date로 변환한다", () => {
    const parsed = parseDateString("2026-08-16");
    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
  });

  it("빈 문자열은 null", () => {
    expect(parseDateString("")).toBeNull();
  });

  it("비정상 날짜 형식은 null", () => {
    expect(parseDateString("2026-13-45")).toBeNull();
  });
});

describe("formatDisplayDate", () => {
  it("정상 날짜를 한국어 장문 포맷으로 표시한다", () => {
    expect(formatDisplayDate("2026-08-16")).toBe("2026년 8월 16일");
  });

  it("빈 값은 미정으로 표시한다", () => {
    expect(formatDisplayDate("")).toBe("미정");
  });

  it("비정상 형식도 미정으로 표시한다", () => {
    expect(formatDisplayDate("invalid-date")).toBe("미정");
  });
});

describe("isExpired", () => {
  it("유효기간이 지났으면 true", () => {
    expect(isExpired("2026-01-01", new Date("2026-02-01"))).toBe(true);
  });

  it("유효기간이 남았으면 false", () => {
    expect(isExpired("2026-12-31", new Date("2026-01-01"))).toBe(false);
  });

  it("경계값(현재 시각이 자정과 정확히 같음)에는 만료로 취급하지 않는다", () => {
    expect(isExpired("2026-08-16", new Date("2026-08-16T00:00:00"))).toBe(
      false
    );
  });

  it("validUntil이 빈 문자열이면 미정 처리로 false", () => {
    expect(isExpired("")).toBe(false);
  });
});
