import { describe, expect, it } from "vitest";

import { resolveErrorCopy } from "../error-copy";

describe("resolveErrorCopy", () => {
  it("rate_limited는 재시도 안내를 표시한다", () => {
    const copy = resolveErrorCopy("rate_limited");
    expect(copy.title).toContain("요청이 많습니다");
    expect(copy.showRetry).toBe(true);
  });

  it("upstream_unavailable은 연결 불가 안내를 표시한다", () => {
    const copy = resolveErrorCopy("upstream_unavailable");
    expect(copy.title).toContain("연결할 수 없습니다");
    expect(copy.showRetry).toBe(true);
  });

  it("invalid_data는 재시도 버튼 없이 데이터 문제를 안내한다", () => {
    const copy = resolveErrorCopy("invalid_data");
    expect(copy.title).toContain("데이터에 문제");
    expect(copy.showRetry).toBe(false);
  });

  it.each(["not_found", "not_published", undefined] as const)(
    "%s는 기본 문구로 폴백한다",
    (kind) => {
      const copy = resolveErrorCopy(kind);
      expect(copy.title).toBe("견적서를 불러오지 못했습니다");
      expect(copy.showRetry).toBe(true);
    }
  );
});
