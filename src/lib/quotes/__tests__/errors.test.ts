import { describe, expect, it } from "vitest";

import {
  err,
  invalidDataError,
  notFoundError,
  notPublishedError,
  ok,
  rateLimitedError,
  upstreamUnavailableError,
} from "../errors";

describe("errors", () => {
  it.each([
    ["not_found", notFoundError()],
    ["not_published", notPublishedError()],
    ["invalid_data", invalidDataError()],
    ["upstream_unavailable", upstreamUnavailableError()],
    ["rate_limited", rateLimitedError()],
  ])("%s 헬퍼가 올바른 kind를 생성한다", (kind, error) => {
    expect(error.kind).toBe(kind);
    expect(typeof error.message).toBe("string");
    expect(error.message.length).toBeGreaterThan(0);
  });

  it("메시지에 민감정보로 의심되는 원본 문자열을 그대로 주입하지 않는다", () => {
    const secret = "secret_abcdef1234567890";
    const error = upstreamUnavailableError(undefined, new Error(secret));

    expect(error.message).not.toContain(secret);
  });

  it("ok/err 헬퍼가 QuoteResult 형태를 만든다", () => {
    const success = ok({ value: 1 });
    const failure = err<{ value: number }>(notFoundError());

    expect(success).toEqual({ ok: true, data: { value: 1 } });
    expect(failure.ok).toBe(false);
    if (!failure.ok) {
      expect(failure.error.kind).toBe("not_found");
    }
  });
});
