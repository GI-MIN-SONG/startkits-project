const dateFormatter = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" });

// "YYYY-MM-DD" 문자열을 자정(로컬 타임존) 기준 Date로 변환한다.
// 형식이 잘못됐거나 빈 값이면 null.
export function parseDateString(value: string): Date | null {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// quote-document.tsx의 displayDate()를 이관. 빈 값/잘못된 형식은 "미정".
export function formatDisplayDate(value: string): string {
  const parsed = parseDateString(value);
  return parsed ? dateFormatter.format(parsed) : "미정";
}

// 유효기간(validUntil) 경과 여부. validUntil이 비어 있거나 잘못된 형식이면
// 판정할 수 없으므로 false(미만료 취급)를 반환한다.
// 이 함수는 순수 계산만 담당하며, UI에 만료 배지를 노출하는 것은 이번 단계 범위가 아니다.
export function isExpired(validUntil: string, now: Date = new Date()): boolean {
  const parsed = parseDateString(validUntil);
  if (!parsed) return false;

  return parsed.getTime() < now.getTime();
}
