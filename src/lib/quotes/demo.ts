import type { Quote } from "./types";

export const demoQuote: Quote = {
  id: "demo",
  title: "브랜드 웹사이트 제작 견적서",
  issueDate: "2026-08-16",
  validUntil: "2026-08-30",
  provider: "스튜디오 모노\n서울특별시 성동구\n사업자등록번호 123-45-67890",
  client: "주식회사 새봄\n마케팅팀 담당자님",
  items: [
    {
      id: "discovery",
      name: "서비스 기획 및 UX 설계",
      description: "요구사항 분석, 정보 구조, 핵심 화면 와이어프레임",
      quantity: 1,
      unitPrice: 1200000,
    },
    {
      id: "design",
      name: "반응형 UI 디자인",
      description: "데스크톱·모바일 주요 화면 디자인",
      quantity: 1,
      unitPrice: 1800000,
    },
    {
      id: "development",
      name: "프론트엔드 개발",
      description: "Next.js 기반 반응형 웹 구현",
      quantity: 1,
      unitPrice: 2400000,
    },
  ],
  notes:
    "본 견적은 발행일로부터 14일간 유효하며, 세부 범위 변경 시 금액이 조정될 수 있습니다.",
};
