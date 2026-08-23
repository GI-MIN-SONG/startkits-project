import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getQuoteResult } from "../index";

describe("getQuoteResult", () => {
  beforeEach(() => {
    vi.stubEnv("NOTION_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("id가 demo면 데모 견적서를 ok로 감싸 반환한다", async () => {
    const result = await getQuoteResult("demo");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe("demo");
  });

  it("demo가 아닌 id는 fetchNotionQuote로 위임한다 (API 키 없으면 not_found)", async () => {
    const result = await getQuoteResult("any-page-id");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("not_found");
  });
});
