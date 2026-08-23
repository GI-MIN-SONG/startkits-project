import "server-only";

// 견적서 도메인 전용 구조화 로그 유틸리티. API 키, 토큰, 고객 데이터 등
// 민감정보가 로그로 새 나가지 않도록 allowlist 방식으로만 필드를 허용한다.
export type LogFieldValue = string | number | boolean | null;
export type LogFields = Record<string, LogFieldValue>;

type LogLevel = "info" | "warn" | "error";

// 여기 없는 키는 로그에 남기지 않는다. 새 필드가 필요하면 의도적으로 추가한다.
const ALLOWED_FIELD_KEYS = new Set([
  "errorKind",
  "status",
  "diff",
  "declaredTotal",
  "calculatedTotal",
  "hasNextCursor",
  "itemCount",
  "durationMs",
]);

function sanitizeFields(fields?: LogFields): LogFields {
  if (!fields) return {};

  const sanitized: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (ALLOWED_FIELD_KEYS.has(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function logQuoteEvent(
  level: LogLevel,
  event: string,
  fields?: LogFields
): void {
  const payload = { event, ...sanitizeFields(fields) };

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}
