// invoices DB "상태" 프로퍼티(status 타입)의 옵션 값.
export type QuotePublicationStatus = "대기" | "거절" | "승인";

// D-06 확정: "승인" 상태인 견적서만 공개한다. 이 게이트는 우회하거나
// 완화하지 않는다(shrimp-rules.md Notion 연동 규칙).
export function isPublishable(status: string): boolean {
  return status === "승인";
}
