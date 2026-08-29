import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import invoicesListEmpty from "../__fixtures__/invoices-list-empty.json";
import invoicesListMalformed from "../__fixtures__/invoices-list-malformed.json";
import invoicesListPage1 from "../__fixtures__/invoices-list-page1.json";
import invoicesListPage2 from "../__fixtures__/invoices-list-page2.json";
import { fetchNotionQuoteList } from "../notion";

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

describe("fetchNotionQuoteList (fixture 기반 계약 테스트)", () => {
  beforeEach(() => {
    vi.stubEnv("NOTION_API_KEY", "test-api-key");
    vi.stubEnv("NOTION_DATABASE_ID", "test-database-id");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("단일 페이지 응답을 매핑한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(invoicesListPage2))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      id: "invoice-list-page-3",
      title: "Q-2026-0001",
      client: "테스트 클라이언트 유한회사",
      issueDate: "2026-08-01",
      status: "거절",
    });
  });

  it("has_more: true면 2페이지를 병합하고 두 번째 요청에 start_cursor를 포함한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(invoicesListPage1))
      .mockResolvedValueOnce(jsonResponse(invoicesListPage2));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const secondCallBody = JSON.parse(
      fetchMock.mock.calls[1][1].body as string
    );
    expect(secondCallBody.start_cursor).toBe("cursor-page-2");
  });

  it("상태 혼재(승인/대기/거절)를 필터 없이 모두 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(invoicesListPage1))
        .mockResolvedValueOnce(jsonResponse(invoicesListPage2))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.map((row) => row.status)).toEqual([
      "승인",
      "대기",
      "거절",
    ]);
  });

  it("401 응답은 upstream_unavailable 오류를 반환하고 응답 본문이 새지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ message: "unauthorized" }, 401))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
    expect(result.error.message).not.toContain("unauthorized");
  });

  it("403 응답은 upstream_unavailable 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, 403))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
  });

  it("404 응답(DB ID 오타)은 not_found 오류를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, 404))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("not_found");
  });

  it("400 응답(잘못된 filter/sort)은 upstream_unavailable 오류를 반환하고 요청 body가 로그로 새지 않는다", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, 400))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
    for (const call of consoleErrorSpy.mock.calls) {
      expect(JSON.stringify(call)).not.toContain("sorts");
    }
  });

  it("429 응답은 재시도 후에도 실패하면 rate_limited 오류를 반환한다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 429)));

    const promise = fetchNotionQuoteList();
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("rate_limited");
  });

  it("429 응답 1회 후 200이면 Retry-After를 존중해 재시도로 성공한다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({}, 429, { "Retry-After": "1" }))
        .mockResolvedValueOnce(jsonResponse(invoicesListEmpty))
    );

    const promise = fetchNotionQuoteList();
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.ok).toBe(true);
  });

  it("500 응답은 재시도 없이 즉시 upstream_unavailable을 반환한다", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({}, 500));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("502/503/504는 재시도 후에도 실패하면 upstream_unavailable을 반환한다", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 503)));

    const promise = fetchNotionQuoteList();
    await vi.advanceTimersByTimeAsync(5000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
  });

  it("네트워크 오류(fetch reject)는 throw하지 않고 upstream_unavailable을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValueOnce(new Error("network down"))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("upstream_unavailable");
  });

  it("NOTION_DATABASE_ID 미설정 시 크래시 없이 명확한 실패를 반환하고 값이 메시지에 없다", async () => {
    vi.stubEnv("NOTION_DATABASE_ID", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).not.toContain("test-database-id");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("results: []는 오류가 아니라 빈 배열을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(invoicesListEmpty))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual([]);
  });

  it("properties 누락, title 빈 배열, 날짜/상태 null인 행은 안전하게 처리되고 전체 실패로 번지지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(invoicesListMalformed))
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // properties 누락 행과 title 빈 배열 행은 건너뛰고, null 날짜/상태 행은 안전한 기본값으로 남는다.
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      id: "invoice-list-null-date-status",
      title: "Q-2026-0099",
      client: "",
      issueDate: "2026-08-12",
      status: "",
    });
  });

  it("has_more: true인데 next_cursor: null이면 무한 루프 없이 종료한다", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        results: invoicesListPage2.results,
        has_more: true,
        next_cursor: null,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("100건 이상 다건도 페이지네이션을 따라 누락 없이 수집한다", async () => {
    const manyResults = Array.from({ length: 120 }, (_, index) => ({
      id: `invoice-bulk-${index}`,
      created_time: "2026-08-05T00:00:00.000Z",
      properties: {
        "견적서 번호": {
          type: "title",
          title: [{ plain_text: `Q-BULK-${index}` }],
        },
        클라이언트명: { type: "rich_text", rich_text: [] },
        발행일: { type: "date", date: { start: "2026-08-05" } },
        상태: { type: "status", status: { name: "대기" } },
      },
    }));
    const firstPage = manyResults.slice(0, 100);
    const secondPage = manyResults.slice(100);

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({
            results: firstPage,
            has_more: true,
            next_cursor: "cursor-bulk-2",
          })
        )
        .mockResolvedValueOnce(
          jsonResponse({
            results: secondPage,
            has_more: false,
            next_cursor: null,
          })
        )
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(120);
  });

  it("동일 페이지 ID가 중복되어도 키 충돌 없이 렌더 가능한 형태로 반환한다", async () => {
    const duplicateRow = invoicesListPage2.results[0];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        jsonResponse({
          results: [duplicateRow, duplicateRow],
          has_more: false,
          next_cursor: null,
        })
      )
    );

    const result = await fetchNotionQuoteList();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe(result.data[1].id);
  });

  it("POST 조회에 cache: force-cache와 next.revalidate: 300을 동시에 지정한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(invoicesListEmpty));
    vi.stubGlobal("fetch", fetchMock);

    await fetchNotionQuoteList();

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("force-cache");
    expect(init.next).toEqual({ revalidate: 300 });
  });

  it("성공·실패 전 경로에서 로그·오류 문자열에 API 키, DB ID, 클라이언트명이 포함되지 않는다", async () => {
    const consoleSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(invoicesListPage2))
    );
    const successResult = await fetchNotionQuoteList();
    expect(successResult.ok).toBe(true);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse({}, 500))
    );
    const failureResult = await fetchNotionQuoteList();
    expect(failureResult.ok).toBe(false);

    const loggedText = JSON.stringify([
      ...consoleSpy.mock.calls,
      ...consoleErrorSpy.mock.calls,
    ]);
    expect(loggedText).not.toContain("test-api-key");
    expect(loggedText).not.toContain("test-database-id");
    expect(loggedText).not.toContain("테스트 클라이언트 유한회사");
  });
});
