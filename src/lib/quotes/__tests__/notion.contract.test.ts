import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import invoiceEmptyItems from "../__fixtures__/invoice-empty-items.json";
import invoiceInvalid from "../__fixtures__/invoice-invalid.json";
import invoiceManyItems from "../__fixtures__/invoice-many-items.json";
import invoiceNormal from "../__fixtures__/invoice-normal.json";
import invoiceNotApproved from "../__fixtures__/invoice-not-approved.json";
import itemsMany from "../__fixtures__/items-many.json";
import itemsPage1 from "../__fixtures__/items-paginated-page1.json";
import itemsPage2 from "../__fixtures__/items-paginated-page2.json";
import { fetchNotionQuote } from "../notion";

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

describe("fetchNotionQuote (fixture 기반 계약 테스트)", () => {
  beforeEach(() => {
    vi.stubEnv("NOTION_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("정상 견적서 + 페이지네이션된 items를 Quote로 변환한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(invoiceNormal))
      .mockResolvedValueOnce(jsonResponse(itemsPage1))
      .mockResolvedValueOnce(jsonResponse(itemsPage2));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotionQuote("invoice-normal-page-id");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.title).toBe("Q-2026-0001");
    expect(result.data.items).toHaveLength(2);
    expect(result.data.items.map((item) => item.name)).toEqual([
      "기획 및 설계",
      "프론트엔드 개발",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("빈 항목 견적서는 items가 빈 배열이다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(invoiceEmptyItems))
        .mockResolvedValueOnce(
          jsonResponse({ results: [], has_more: false, next_cursor: null })
        )
    );

    const result = await fetchNotionQuote("invoice-empty-items-page-id");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items).toEqual([]);
  });

  it("제목이 없는 견적서는 invalid_data 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(invoiceInvalid))
    );

    const result = await fetchNotionQuote("invoice-invalid-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("invalid_data");
  });

  it("상태가 승인이 아니면 not_published 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(invoiceNotApproved))
    );

    const result = await fetchNotionQuote("invoice-not-approved-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("not_published");
  });

  it("404 응답은 not_found 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, 404))
    );

    const result = await fetchNotionQuote("missing-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("not_found");
  });

  it("429 응답은 재시도 후에도 실패하면 rate_limited 오류를 반환한다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 429)));

    const promise = fetchNotionQuote("rate-limited-page-id");
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("rate_limited");
  });

  it("429 응답 1회 후 200이면 재시도로 정상 조회에 성공한다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({}, 429, { "Retry-After": "1" }))
        .mockResolvedValueOnce(jsonResponse(invoiceNormal))
        .mockResolvedValueOnce(jsonResponse(itemsPage1))
        .mockResolvedValueOnce(jsonResponse(itemsPage2))
    );

    const promise = fetchNotionQuote("invoice-normal-page-id");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.ok).toBe(true);
  });

  it("500 응답은 upstream_unavailable 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, 500))
    );

    const result = await fetchNotionQuote("server-error-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
  });

  it("네트워크 오류(fetch reject)는 upstream_unavailable 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("network down"))
    );

    const result = await fetchNotionQuote("network-error-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
  });

  it("items 조회 중 429가 발생하면 전체 결과가 rate_limited로 전파된다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(invoiceNormal))
        .mockResolvedValue(jsonResponse({}, 429))
    );

    const promise = fetchNotionQuote("invoice-normal-page-id");
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("rate_limited");
  });

  it("20개 이상 항목/긴 텍스트/큰 금액도 손실 없이 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(invoiceManyItems))
        .mockResolvedValueOnce(jsonResponse(itemsMany))
    );

    const result = await fetchNotionQuote("invoice-many-items-page-id");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.items).toHaveLength(21);
    expect(result.data.client).toContain("신사업개발파트");
    expect(result.data.items[0].name).toContain("긴 품목명 테스트용 케이스");
    expect(result.data.items[20].unitPrice).toBe(100000000);
  });

  it("NOTION_API_KEY가 없으면 not_found 오류를 반환한다", async () => {
    vi.stubEnv("NOTION_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotionQuote("any-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("not_found");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
