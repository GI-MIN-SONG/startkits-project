import { afterEach, describe, expect, it, vi } from "vitest";

import { logQuoteEvent } from "../logger";

describe("logQuoteEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allowlist에 있는 필드만 통과시킨다", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logQuoteEvent("warn", "quote_items_fetch_rate_limited", {
      status: 429,
      hasNextCursor: true,
    });

    expect(spy).toHaveBeenCalledWith({
      event: "quote_items_fetch_rate_limited",
      status: 429,
      hasNextCursor: true,
    });
  });

  it("allowlist에 없는 민감 필드(apiKey, client 등)는 로그에서 제거된다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logQuoteEvent("error", "quote_fetch_failed", {
      apiKey: "secret_abc123",
      client: "실제 고객사명",
      status: 500,
    });

    const [payload] = spy.mock.calls[0] as [Record<string, unknown>];
    expect(payload).not.toHaveProperty("apiKey");
    expect(payload).not.toHaveProperty("client");
    expect(payload.status).toBe(500);
  });

  it("level에 맞는 console 메서드를 호출한다", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    logQuoteEvent("info", "quote_fetch_succeeded", { itemCount: 3 });

    expect(infoSpy).toHaveBeenCalledTimes(1);
  });
});
