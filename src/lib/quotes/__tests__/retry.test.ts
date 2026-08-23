import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithRetry } from "../retry";

function jsonResponse(status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({}), { status, headers });
}

describe("fetchWithRetry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("정상 응답(200)은 재시도 없이 즉시 반환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithRetry("https://example.com", {});

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("500은 재시도하지 않고 즉시 반환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(500));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithRetry("https://example.com", {});

    expect(response.status).toBe(500);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("429는 Retry-After 헤더만큼 대기 후 재시도해 성공한다", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429, { "Retry-After": "1" }))
      .mockResolvedValueOnce(jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry("https://example.com", {});
    await vi.advanceTimersByTimeAsync(1000);
    const response = await promise;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("Retry-After 헤더가 없으면 기본 백오프로 재시도한다", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(429))
      .mockResolvedValueOnce(jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry("https://example.com", {});
    await vi.advanceTimersByTimeAsync(500);
    const response = await promise;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("503(일시적 5xx)도 재시도 대상이다", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503))
      .mockResolvedValueOnce(jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry("https://example.com", {});
    await vi.advanceTimersByTimeAsync(500);
    const response = await promise;

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("최대 재시도 횟수를 초과하면 마지막 실패 응답을 그대로 반환한다", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(429));
    vi.stubGlobal("fetch", fetchMock);

    const promise = fetchWithRetry(
      "https://example.com",
      {},
      { maxRetries: 2 }
    );
    await vi.advanceTimersByTimeAsync(5000);
    const response = await promise;

    expect(response.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
