import type { QuoteErrorKind } from "./errors";

export type QuoteErrorCopy = {
  title: string;
  description: string;
  showRetry: boolean;
};

const DEFAULT_COPY: QuoteErrorCopy = {
  title: "견적서를 불러오지 못했습니다",
  description: "잠시 후 다시 시도해 주세요.",
  showRetry: true,
};

const COPY_BY_KIND: Partial<Record<QuoteErrorKind, QuoteErrorCopy>> = {
  rate_limited: {
    title: "요청이 많습니다",
    description: "잠시 후 다시 시도해 주세요.",
    showRetry: true,
  },
  upstream_unavailable: {
    title: "일시적으로 연결할 수 없습니다",
    description:
      "Notion 서버 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.",
    showRetry: true,
  },
  invalid_data: {
    title: "견적서 데이터에 문제가 있습니다",
    description: "필수 정보가 누락되었거나 형식이 올바르지 않습니다.",
    showRetry: false,
  },
};

// error.tsx가 error.cause(QuoteError)의 kind를 기반으로 표시할 문구를 결정한다.
// kind가 없거나(예상 밖 예외) 매핑이 없으면 기본 문구로 안전하게 폴백한다.
export function resolveErrorCopy(
  kind: QuoteErrorKind | undefined
): QuoteErrorCopy {
  if (!kind) return DEFAULT_COPY;
  return COPY_BY_KIND[kind] ?? DEFAULT_COPY;
}
