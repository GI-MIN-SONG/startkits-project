import "server-only";

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const DEFAULT_BACKOFF_MS = [500, 1500];
const MAX_TOTAL_WAIT_MS = 5000;

function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

  const date = new Date(header).getTime();
  if (Number.isNaN(date)) return undefined;

  return Math.max(0, date - Date.now());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type FetchWithRetryOptions = {
  maxRetries?: number;
};

// 429/502/503/504만 재시도 대상으로 삼는다. 500은 즉시 반환해 불필요한
// 지연을 만들지 않는다(호출부가 upstream_unavailable로 분류).
// 총 대기 시간은 MAX_TOTAL_WAIT_MS를 넘지 않도록 제한해 서버 컴포넌트
// 렌더링이 과도하게 지연되지 않게 한다.
export async function fetchWithRetry(
  input: string | URL,
  init: RequestInit,
  { maxRetries = 2 }: FetchWithRetryOptions = {}
): Promise<Response> {
  let totalWaitMs = 0;
  let attempt = 0;

  for (;;) {
    const response = await fetch(input, init);

    if (!RETRYABLE_STATUS.has(response.status) || attempt >= maxRetries) {
      return response;
    }

    const retryAfterMs = parseRetryAfterMs(response.headers.get("Retry-After"));
    const backoffMs =
      retryAfterMs ?? DEFAULT_BACKOFF_MS[attempt] ?? DEFAULT_BACKOFF_MS.at(-1)!;

    if (totalWaitMs + backoffMs > MAX_TOTAL_WAIT_MS) {
      return response;
    }

    totalWaitMs += backoffMs;
    attempt += 1;
    await sleep(backoffMs);
  }
}
