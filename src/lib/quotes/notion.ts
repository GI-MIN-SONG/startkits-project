import "server-only";

import type { Quote, QuoteItem } from "./types";

type RichText = { plain_text?: string };
type Property = {
  type?: string;
  title?: RichText[];
  rich_text?: RichText[];
  date?: { start?: string | null } | null;
  number?: number | null;
  select?: { name?: string } | null;
};
type NotionPage = {
  id?: string;
  created_time?: string;
  properties?: Record<string, Property>;
};

const NOTION_VERSION = "2022-06-28";

function text(property?: Property) {
  const values = property?.title ?? property?.rich_text ?? [];
  return values
    .map((value) => value.plain_text ?? "")
    .join("")
    .trim();
}

function date(property?: Property) {
  return property?.date?.start?.slice(0, 10) ?? "";
}

function parseItems(property?: Property): QuoteItem[] {
  const raw = text(property);
  if (!raw) return [];

  try {
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    return items.flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const value = item as Record<string, unknown>;
      if (typeof value.name !== "string") return [];
      return [
        {
          id: String(value.id ?? index),
          name: value.name,
          description:
            typeof value.description === "string"
              ? value.description
              : undefined,
          quantity: typeof value.quantity === "number" ? value.quantity : 0,
          unitPrice: typeof value.unitPrice === "number" ? value.unitPrice : 0,
        },
      ];
    });
  } catch {
    return [];
  }
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

  const page = (await response.json()) as NotionPage;
  const properties = page.properties ?? {};
  const status = properties["상태"]?.select?.name;
  if (status && status !== "발행됨") return null;

  const title = text(properties["견적서명"]);
  if (!title) return null;

  return {
    id: page.id ?? pageId,
    title,
    issueDate:
      date(properties["발행일"]) || page.created_time?.slice(0, 10) || "",
    validUntil: date(properties["유효기간"]),
    provider: text(properties["공급자 정보"]),
    client: text(properties["클라이언트명"]),
    items: parseItems(properties["항목"]),
    notes: text(properties["비고"]) || undefined,
  };
}
