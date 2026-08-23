// 견적서 도메인 공통 오류 분류. ROADMAP.md 단계 2 범위(5종 분류 + 공통 결과 타입).
export type QuoteErrorKind =
  | "not_found" // 견적서 페이지가 존재하지 않음 (404)
  | "not_published" // 상태 프로퍼티가 "승인"이 아님
  | "invalid_data" // 필수 필드 누락, 파싱 실패 등 데이터 형식 문제
  | "upstream_unavailable" // 429 외 5xx, 네트워크 오류, timeout 등
  | "rate_limited"; // HTTP 429

export type QuoteError = {
  kind: QuoteErrorKind;
  message: string;
  cause?: unknown;
};

export type QuoteResult<T> =
  { ok: true; data: T } | { ok: false; error: QuoteError };

function createError(
  kind: QuoteErrorKind,
  message: string,
  cause?: unknown
): QuoteError {
  return { kind, message, cause };
}

export function notFoundError(
  message = "견적서를 찾을 수 없습니다."
): QuoteError {
  return createError("not_found", message);
}

export function notPublishedError(
  message = "공개되지 않은 견적서입니다."
): QuoteError {
  return createError("not_published", message);
}

export function invalidDataError(
  message = "견적서 데이터 형식이 올바르지 않습니다.",
  cause?: unknown
): QuoteError {
  return createError("invalid_data", message, cause);
}

export function upstreamUnavailableError(
  message = "견적서 정보를 불러오지 못했습니다.",
  cause?: unknown
): QuoteError {
  return createError("upstream_unavailable", message, cause);
}

export function rateLimitedError(
  message = "요청이 많아 잠시 후 다시 시도해 주세요.",
  cause?: unknown
): QuoteError {
  return createError("rate_limited", message, cause);
}

export function ok<T>(data: T): QuoteResult<T> {
  return { ok: true, data };
}

export function err<T>(error: QuoteError): QuoteResult<T> {
  return { ok: false, error };
}
