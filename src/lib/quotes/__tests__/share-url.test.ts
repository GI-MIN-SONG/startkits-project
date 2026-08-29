import { describe, expect, it } from "vitest";

import { buildQuoteShareUrl } from "../share-url";

describe("buildQuoteShareUrl", () => {
  it("일반 origin과 페이지 ID로 절대 URL을 만든다", () => {
    expect(
      buildQuoteShareUrl("https://example.com", "invoice-normal-page-id")
    ).toBe("https://example.com/quote/invoice-normal-page-id");
  });

  it("포트를 포함한 localhost origin도 그대로 유지한다", () => {
    expect(buildQuoteShareUrl("http://localhost:3000", "abc123")).toBe(
      "http://localhost:3000/quote/abc123"
    );
  });

  it("origin 끝에 슬래시가 있어도 중복되지 않는다", () => {
    expect(buildQuoteShareUrl("https://example.com/", "abc123")).toBe(
      "https://example.com/quote/abc123"
    );
  });

  it("하이픈 포함/미포함 32자 Notion ID를 원본 그대로 유지한다", () => {
    const withHyphen = "3c4eca35-ed7a-8019-b995-c4dbe8460fb0";
    const withoutHyphen = "3c4eca35ed7a8019b995c4dbe8460fb0";

    expect(buildQuoteShareUrl("https://example.com", withHyphen)).toBe(
      `https://example.com/quote/${withHyphen}`
    );
    expect(buildQuoteShareUrl("https://example.com", withoutHyphen)).toBe(
      `https://example.com/quote/${withoutHyphen}`
    );
  });

  it("빈 문자열 또는 공백만 있는 ID는 링크를 만들지 않고 null을 반환한다", () => {
    expect(buildQuoteShareUrl("https://example.com", "")).toBeNull();
    expect(buildQuoteShareUrl("https://example.com", "   ")).toBeNull();
  });

  it("ID에 ../, ?, #이 포함되면 인코딩되어 경로 이탈·쿼리 주입이 발생하지 않는다", () => {
    const result = buildQuoteShareUrl("https://example.com", "../secret?x=1#y");

    expect(result).toBe("https://example.com/quote/..%2Fsecret%3Fx%3D1%23y");
    expect(result).not.toContain("../secret?x=1#y");
  });
});
