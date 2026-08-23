export type QuoteItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  title: string;
  issueDate: string;
  validUntil: string;
  client: string;
  items: QuoteItem[];
};

export function quoteTotal(quote: Quote) {
  return quote.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );
}
