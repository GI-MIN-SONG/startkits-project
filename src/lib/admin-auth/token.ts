// 관리자 세션 토큰 서명·검증. Web Crypto API(globalThis.crypto.subtle)만 사용한다.
// Next.js 16의 proxy.ts는 기본 Node.js 런타임이지만, Node 전용 crypto 모듈 대신
// 표준 Web Crypto만 써서 런타임 변경에 영향받지 않게 만든다.

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12시간

type SessionPayload = {
  iat: number;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다. 관리자 인증을 사용하려면 반드시 설정해야 합니다."
    );
  }
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (padded.length % 4)) % 4);
  const binary = atob(padded + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return base64UrlEncode(new Uint8Array(signature));
}

// 발급시각(iat)과 만료시각(exp, 12시간 뒤)을 담은 payload를 HMAC-SHA256으로 서명해
// "base64url(payload).base64url(signature)" 형태의 토큰 문자열을 만든다.
export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const now = Date.now();
  const payload: SessionPayload = { iat: now, exp: now + SESSION_TTL_MS };
  const payloadEncoded = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signature = await sign(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
}

// 서명 위조 여부와 만료 여부를 모두 검증한다.
export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return false;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }

  const expectedSignature = await sign(payloadEncoded, secret);
  if (!constantTimeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadEncoded))
    ) as SessionPayload;
    return typeof payload.exp === "number" && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

// 타이밍 공격 방지를 위해 문자열 길이와 무관하게 항상 동일한 시간에 비교한다.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
