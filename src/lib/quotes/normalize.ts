// 값의 의미를 바꾸지 않는 최소 정규화만 수행한다. 음수/소수 수량 같은
// 비즈니스 정책 판단은 별도 결정 없이 여기서 확대하지 않는다.

export function normalizeText(value: string): string {
  return value.trim();
}

// NaN/Infinity처럼 표시가 불가능한 수치만 0으로 치환하고, 그 외 값은
// (음수·소수 포함) 그대로 통과시킨다.
export function normalizeQuantity(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
