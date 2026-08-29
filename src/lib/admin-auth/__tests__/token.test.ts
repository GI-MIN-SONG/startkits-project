import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionToken, verifySessionToken } from "../token";

describe("createSessionToken / verifySessionToken", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("정상 발급한 토큰은 검증에 성공한다", async () => {
    const token = await createSessionToken();

    expect(await verifySessionToken(token)).toBe(true);
  });

  it("서명 부분이 변조된 토큰은 검증에 실패한다", async () => {
    const token = await createSessionToken();
    const [payload, signature] = token.split(".");
    const tamperedSignature =
      signature.slice(0, -1) + (signature.at(-1) === "a" ? "b" : "a");

    expect(await verifySessionToken(`${payload}.${tamperedSignature}`)).toBe(
      false
    );
  });

  it("payload가 변조된 토큰은 검증에 실패한다", async () => {
    const token = await createSessionToken();
    const [, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ iat: Date.now(), exp: Date.now() + 999999999 })
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(await verifySessionToken(`${tamperedPayload}.${signature}`)).toBe(
      false
    );
  });

  it("만료 시각이 지난 토큰은 검증에 실패한다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const token = await createSessionToken();

    vi.setSystemTime(new Date("2026-01-02T00:00:00.000Z")); // 12시간 TTL을 넘어선 시점

    expect(await verifySessionToken(token)).toBe(false);
  });

  it("만료 시각 이전이면 검증에 성공한다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const token = await createSessionToken();

    vi.setSystemTime(new Date("2026-01-01T06:00:00.000Z")); // 12시간 TTL 이내

    expect(await verifySessionToken(token)).toBe(true);
  });

  it("다른 시크릿으로 만든 토큰은 검증에 실패한다", async () => {
    const token = await createSessionToken();

    vi.stubEnv("ADMIN_SESSION_SECRET", "different-secret");

    expect(await verifySessionToken(token)).toBe(false);
  });

  it("빈 값이나 형식이 잘못된 토큰은 검증에 실패한다", async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("")).toBe(false);
    expect(await verifySessionToken("not-a-valid-token")).toBe(false);
  });

  it("ADMIN_SESSION_SECRET 미설정 시 createSessionToken은 에러를 던진다", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");

    await expect(createSessionToken()).rejects.toThrow();
  });

  it("ADMIN_SESSION_SECRET 미설정 시 verifySessionToken은 예외 없이 false를 반환한다", async () => {
    const token = await createSessionToken();
    vi.stubEnv("ADMIN_SESSION_SECRET", "");

    expect(await verifySessionToken(token)).toBe(false);
  });
});
