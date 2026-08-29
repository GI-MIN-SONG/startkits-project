import type { Metadata } from "next";

import { CopyLinkButton } from "@/components/quote/copy-link-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuoteListResult } from "@/lib/quotes";
import { isPublishable } from "@/lib/quotes/status";

export const metadata: Metadata = {
  title: "견적서 목록",
};

// 새 색상 토큰을 추가하지 않고 기존 Badge variant만으로 상태 3종을 구분한다.
function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "승인") return "default";
  if (status === "거절") return "destructive";
  if (status === "대기") return "secondary";
  return "outline";
}

export default async function AdminQuotesPage() {
  const result = await getQuoteListResult();

  // 실패는 error.tsx로 위임한다(상세 페이지의 not_found/not_published 분기와
  // 달리, 목록 조회 실패는 "없음"이 아니라 항상 오류 상태로 취급한다).
  if (!result.ok) {
    throw new Error(result.error.message, { cause: result.error });
  }

  const quotes = result.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">견적서 목록</h1>

      {quotes.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          아직 등록된 견적서가 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>견적서 번호</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>클라이언트명</TableHead>
                <TableHead>발행일</TableHead>
                <TableHead className="text-right">공유 링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(quote.status)}>
                      {quote.status || "미정"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.client}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.issueDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <CopyLinkButton
                      quoteId={quote.id}
                      quoteTitle={quote.title}
                      isPublished={isPublishable(quote.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
