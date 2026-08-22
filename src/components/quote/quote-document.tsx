import { CalendarDaysIcon, FileTextIcon } from "lucide-react";

import { PrintButton } from "./print-button";
import type { Quote } from "@/lib/quotes";
import { quoteTotal } from "@/lib/quotes";

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" });

function displayDate(value: string) {
  return value ? dateFormat.format(new Date(`${value}T00:00:00`)) : "미정";
}

export function QuoteDocument({ quote }: { quote: Quote }) {
  const total = quoteTotal(quote);

  return (
    <article className="quote-sheet mx-auto w-full max-w-5xl bg-card px-5 py-8 text-card-foreground shadow-sm sm:px-10 sm:py-12 lg:px-16">
      <header className="border-b border-border pb-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
              <FileTextIcon className="size-4" aria-hidden="true" />
              INVOICE WEB
            </div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              견적서
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {quote.title}
            </h1>
          </div>
          <PrintButton />
        </div>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-3">
            <CalendarDaysIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-muted-foreground">발행일</dt>
              <dd className="font-medium">{displayDate(quote.issueDate)}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-4 py-3">
            <CalendarDaysIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <dt className="text-muted-foreground">유효기간</dt>
              <dd className="font-medium">{displayDate(quote.validUntil)}</dd>
            </div>
          </div>
        </dl>
      </header>

      <section
        aria-labelledby="parties"
        className="grid gap-8 border-b border-border py-8 sm:grid-cols-2"
      >
        <h2 id="parties" className="sr-only">
          공급자 및 클라이언트 정보
        </h2>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground">
            FROM
          </p>
          <p className="whitespace-pre-line leading-7">
            {quote.provider || "정보 없음"}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground">
            TO
          </p>
          <p className="whitespace-pre-line leading-7">
            {quote.client || "정보 없음"}
          </p>
        </div>
      </section>

      <section aria-labelledby="items-title" className="py-8">
        <h2 id="items-title" className="mb-4 text-lg font-semibold">
          견적 항목
        </h2>
        {quote.items.length ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-2xl border-collapse text-sm">
              <thead className="bg-muted/70 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">품목</th>
                  <th className="px-4 py-3 text-right font-medium">수량</th>
                  <th className="px-4 py-3 text-right font-medium">단가</th>
                  <th className="px-4 py-3 text-right font-medium">소계</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-4">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="mt-1 text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {item.quantity.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {currency.format(item.unitPrice)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium tabular-nums">
                      {currency.format(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
            등록된 견적 항목이 없습니다.
          </div>
        )}
      </section>

      <section
        className="ml-auto w-full max-w-sm border-t-2 border-foreground pt-5"
        aria-label="합계"
      >
        <div className="flex items-baseline justify-between gap-6">
          <span className="text-muted-foreground">총 견적 금액</span>
          <strong className="text-2xl tabular-nums">
            {currency.format(total)}
          </strong>
        </div>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          부가세 포함 여부는 공급자에게 확인해 주세요.
        </p>
      </section>

      {quote.notes && (
        <aside className="mt-10 rounded-xl bg-muted/60 p-5 text-sm leading-6 text-muted-foreground">
          <strong className="mb-1 block text-foreground">안내 사항</strong>
          {quote.notes}
        </aside>
      )}
    </article>
  );
}
