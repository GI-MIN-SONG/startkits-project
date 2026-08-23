import type { Quote } from "./types";

export const demoQuote: Quote = {
  id: "demo",
  title: "브랜드 웹사이트 제작 견적서",
  issueDate: "2026-08-16",
  validUntil: "2026-08-30",
  client: "주식회사 새봄\n마케팅팀 담당자님",
  items: [
    {
      id: "discovery",
      name: "서비스 기획 및 UX 설계",
      quantity: 1,
      unitPrice: 1200000,
    },
    {
      id: "design",
      name: "반응형 UI 디자인",
      quantity: 1,
      unitPrice: 1800000,
    },
    {
      id: "development",
      name: "프론트엔드 개발",
      quantity: 1,
      unitPrice: 2400000,
    },
  ],
};
