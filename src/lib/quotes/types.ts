export type QuoteItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  title: string;
  issueDate: string;
  validUntil: string;
  provider: string;
  client: string;
  items: QuoteItem[];
  notes?: string;
};

export function quoteTotal(quote: Quote) {
  return quote.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );
}
