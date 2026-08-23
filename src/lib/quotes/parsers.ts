// Notion API 응답 프로퍼티 → 내부 모델(문자열/숫자) 변환 공통 파서.
// 이 파일은 Notion 원시 타입만 다루며 UI/네트워크 계층에 의존하지 않는다.

export type NotionRichTextValue = { plain_text?: string };

export type NotionRichTextLike = {
  title?: NotionRichTextValue[];
  rich_text?: NotionRichTextValue[];
};

export type NotionDateLike = {
  date?: { start?: string | null } | null;
};

export type NotionNumberLike = {
  number?: number | null;
};

export type NotionFormulaLike = {
  formula?: { type?: string; number?: number | null };
};

export type NotionStatusLike = {
  status?: { name?: string } | null;
};

// Title 또는 Rich Text 프로퍼티의 plain_text 배열을 이어 붙인다.
export function parseRichText(property?: NotionRichTextLike): string {
  const values = property?.title ?? property?.rich_text ?? [];
  return values
    .map((value) => value.plain_text ?? "")
    .join("")
    .trim();
}

// Title 프로퍼티 전용 별칭. 의미를 명확히 하기 위해 parseRichText와 분리한다.
export function parseTitle(property?: NotionRichTextLike): string {
  return parseRichText(property);
}

// Date 프로퍼티에서 YYYY-MM-DD만 취한다. 시작일이 없으면 빈 문자열.
export function parseDate(property?: NotionDateLike): string {
  return property?.date?.start?.slice(0, 10) ?? "";
}

// Number 프로퍼티. 값이 없으면 0.
export function parseNumber(property?: NotionNumberLike): number {
  return property?.number ?? 0;
}

// Formula 프로퍼티. 계산 결과가 number 타입일 때만 값을 취하고, 그 외엔 0.
export function parseFormulaNumber(property?: NotionFormulaLike): number {
  if (property?.formula?.type !== "number") return 0;
  return property.formula.number ?? 0;
}

// Status 프로퍼티의 옵션 이름. 값이 없으면 빈 문자열.
export function parseStatusOption(property?: NotionStatusLike): string {
  return property?.status?.name ?? "";
}
