// 견적서 공유 링크 조립 순수 함수. server-only 의존성이 없어야
// 클라이언트 컴포넌트(copy-link-button.tsx)에서 index.ts를 거치지 않고 직접 import할 수 있다.
export function buildQuoteShareUrl(
  origin: string,
  quoteId: string
): string | null {
  const trimmedId = quoteId.trim();
  if (!trimmedId) return null;

  const normalizedOrigin = origin.replace(/\/+$/, "");
  return `${normalizedOrigin}/quote/${encodeURIComponent(trimmedId)}`;
}
