import "server-only";

import type { Quote, QuoteItem } from "./types";

const NOTION_VERSION = "2022-06-28";
const ITEMS_DATABASE_ID = "3c4eca35-ed7a-8019-b995-c4dbe8460fb0";

type RichText = { plain_text?: string };

// invoices DB 페이지 프로퍼티 (한글 프로퍼티 이름은 실제 Notion 스키마와 동일하게 유지)
type InvoiceProperty = {
  type?: string;
  title?: RichText[];
  rich_text?: RichText[];
  date?: { start?: string | null } | null;
  number?: number | null;
  status?: { name?: string } | null;
  relation?: { id: string }[];
};
type InvoicePage = {
  id?: string;
  created_time?: string;
  properties?: Record<string, InvoiceProperty>;
};

// items DB 페이지 프로퍼티. `금액`은 formula 타입이라 결과값이 한 겹 더 감싸여 있다.
type ItemProperty = {
  type?: string;
  title?: RichText[];
  number?: number | null;
  formula?: { type?: string; number?: number | null };
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

function text(property?: InvoiceProperty) {
  const values = property?.title ?? property?.rich_text ?? [];
  return values
    .map((value) => value.plain_text ?? "")
    .join("")
    .trim();
}

function date(property?: InvoiceProperty) {
  return property?.date?.start?.slice(0, 10) ?? "";
}

function itemTitle(property?: ItemProperty) {
  return (property?.title ?? [])
    .map((value) => value.plain_text ?? "")
    .join("")
    .trim();
}

// items DB에서 견적서(invoicePageId)에 연결된 라인 아이템 전체를 페이지네이션으로 수집한다.
async function fetchQuoteItems(
  apiKey: string,
  invoicePageId: string
): Promise<QuoteItem[]> {
  const items: QuoteItem[] = [];
  let cursor: string | undefined;

  do {
    const response = await fetch(
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

    if (!response.ok)
      throw new Error(`Notion API request failed: ${response.status}`);

    const page = (await response.json()) as NotionListResponse<ItemPage>;

    for (const [index, row] of page.results.entries()) {
      const properties = row.properties ?? {};
      const name = itemTitle(properties["항목명"]);
      if (!name) continue;

      items.push({
        id: row.id ?? String(index),
        name,
        quantity: properties["수량"]?.number ?? 0,
        unitPrice: properties["단가"]?.number ?? 0,
      });
    }

    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return items;
}

export async function fetchNotionQuote(pageId: string): Promise<Quote | null> {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
    },
    next: { revalidate: 300 },
  });

  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Notion API request failed: ${response.status}`);

  const page = (await response.json()) as InvoicePage;
  const properties = page.properties ?? {};

  // 상태가 "승인"인 견적서만 공개한다.
  const status = properties["상태"]?.status?.name;
  if (status !== "승인") return null;

  const title = text(properties["견적서 번호"]);
  if (!title) return null;

  const invoicePageId = page.id ?? pageId;

  return {
    id: invoicePageId,
    title,
    issueDate:
      date(properties["발행일"]) || page.created_time?.slice(0, 10) || "",
    validUntil: date(properties["유효기간"]),
    client: text(properties["클라이언트명"]),
    items: await fetchQuoteItems(apiKey, invoicePageId),
  };
}
