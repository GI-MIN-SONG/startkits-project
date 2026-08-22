import { demoQuote } from "./demo";
import { fetchNotionQuote } from "./notion";

export async function getQuote(id: string) {
  if (id === "demo") return demoQuote;
  return fetchNotionQuote(id);
}

export type { Quote, QuoteItem } from "./types";
export { quoteTotal } from "./types";
