import "server-only";

import {
  invalidDataError,
  notFoundError,
  notPublishedError,
  ok,
  err,
  rateLimitedError,
  upstreamUnavailableError,
  type QuoteResult,
} from "./errors";
import { logQuoteEvent } from "./logger";
import {
  parseDate,
  parseNumber,
  parseRichText,
  parseStatusOption,
  parseTitle,
  type NotionDateLike,
  type NotionFormulaLike,
  type NotionNumberLike,
  type NotionRichTextLike,
  type NotionStatusLike,
} from "./parsers";
import { fetchWithRetry } from "./retry";
import { isPublishable } from "./status";
import type { Quote, QuoteItem } from "./types";

const NOTION_VERSION = "2022-06-28";
const ITEMS_DATABASE_ID = "3c4eca35-ed7a-8019-b995-c4dbe8460fb0";

// invoices DB 페이지 프로퍼티 (한글 프로퍼티 이름은 실제 Notion 스키마와 동일하게 유지)
type InvoiceProperty = NotionRichTextLike &
  NotionDateLike &
  NotionNumberLike &
  NotionStatusLike & {
    type?: string;
    relation?: { id: string }[];
  };
type InvoicePage = {
  id?: string;
  created_time?: string;
  properties?: Record<string, InvoiceProperty>;
};

// items DB 페이지 프로퍼티. `금액`은 formula 타입이라 결과값이 한 겹 더 감싸여 있다.
type ItemProperty = NotionRichTextLike &
  NotionNumberLike &
  NotionFormulaLike & {
    type?: string;
  };
type ItemPage = {
  id?: string;
  properties?: Record<string, ItemProperty>;
};

type NotionListResponse<T> = {
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
};

// items DB에서 견적서(invoicePageId)에 연결된 라인 아이템 전체를 페이지네이션으로 수집한다.
async function fetchQuoteItems(
  apiKey: string,
  invoicePageId: string
): Promise<QuoteResult<QuoteItem[]>> {
  const items: QuoteItem[] = [];
  let cursor: string | undefined;

  do {
    let response: Response;
    try {
      response = await fetchWithRetry(
        `https://api.notion.com/v1/databases/${ITEMS_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filter: {
              property: "invoices",
              relation: { contains: invoicePageId },
            },
            ...(cursor ? { start_cursor: cursor } : {}),
          }),
          cache: "force-cache",
          next: { revalidate: 300 },
        }
      );
    } catch (cause) {
      logQuoteEvent("error", "quote_items_fetch_network_error");
      return err(upstreamUnavailableError(undefined, cause));
    }

    if (response.status === 429) {
      logQuoteEvent("warn", "quote_items_fetch_rate_limited", {
        status: response.status,
      });
      return err(rateLimitedError());
    }
    if (!response.ok) {
      logQuoteEvent("error", "quote_items_fetch_failed", {
        status: response.status,
      });
      return err(upstreamUnavailableError());
    }

    const page = (await response.json()) as NotionListResponse<ItemPage>;

    for (const [index, row] of page.results.entries()) {
      const properties = row.properties ?? {};
      const name = parseTitle(properties["항목명"]);
      if (!name) continue;

      items.push({
        id: row.id ?? String(index),
        name,
        quantity: parseNumber(properties["수량"]),
        unitPrice: parseNumber(properties["단가"]),
      });
    }

    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return ok(items);
}

export async function fetchNotionQuote(
  pageId: string
): Promise<QuoteResult<Quote>> {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return err(notFoundError());

  let response: Response;
  try {
    response = await fetchWithRetry(
      `https://api.notion.com/v1/pages/${pageId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": NOTION_VERSION,
        },
        next: { revalidate: 300 },
      }
    );
  } catch (cause) {
    logQuoteEvent("error", "quote_page_fetch_network_error");
    return err(upstreamUnavailableError(undefined, cause));
  }

  if (response.status === 404) return err(notFoundError());
  if (response.status === 429) {
    logQuoteEvent("warn", "quote_page_fetch_rate_limited", {
      status: response.status,
    });
    return err(rateLimitedError());
  }
  if (!response.ok) {
    logQuoteEvent("error", "quote_page_fetch_failed", {
      status: response.status,
    });
    return err(upstreamUnavailableError());
  }

  const page = (await response.json()) as InvoicePage;
  const properties = page.properties ?? {};

  // 상태가 "승인"인 견적서만 공개한다 (D-06 확정).
  const status = parseStatusOption(properties["상태"]);
  if (!isPublishable(status)) return err(notPublishedError());

  const title = parseTitle(properties["견적서 번호"]);
  if (!title) return err(invalidDataError());

  const invoicePageId = page.id ?? pageId;

  const itemsResult = await fetchQuoteItems(apiKey, invoicePageId);
  if (!itemsResult.ok) return itemsResult;

  return ok({
    id: invoicePageId,
    title,
    issueDate:
      parseDate(properties["발행일"]) || page.created_time?.slice(0, 10) || "",
    validUntil: parseDate(properties["유효기간"]),
    client: parseRichText(properties["클라이언트명"]),
    items: itemsResult.data,
  });
}
