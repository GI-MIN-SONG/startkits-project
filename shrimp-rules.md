# Development Guidelines (AI Agent 전용)

이 문서는 AI Coding Agent가 이 저장소에서 작업할 때 지켜야 할 프로젝트 전용 규칙만 담는다. 일반적인 Next.js/React/TypeScript 지식은 포함하지 않는다.

## 프로젝트 개요

- Next.js 16(App Router) / React 19 / TypeScript / Tailwind CSS v4 / shadcn/ui(`base-nova`, Base UI 기반) 스타터킷 위에 "Notion 견적서 공유" 기능(`/quote/[id]`)이 얹혀 있다.
- 기준 문서: `docs/PRD.md`(요구사항), `ROADMAP.md`(단계별 실행 계획·의사결정 기록). 견적서 기능을 변경할 때는 반드시 두 문서를 먼저 확인한다.
- 이 저장소는 아직 MVP 이전 단계다. `ROADMAP.md`의 "출시 전 보완 필요" 목록에 있는 항목(공개 토큰 미구현, Notion ID가 URL에 그대로 노출됨, 테스트 부재 등)은 알려진 상태이며, 별도 지시 없이 임의로 "완성"시키지 않는다.

## 디렉터리 구조 및 책임

- `src/app/quote/[id]/` — 견적서 상세 페이지 라우트. `page.tsx`(서버 컴포넌트, Notion 조회), `loading.tsx`, `not-found.tsx`, `error.tsx`로 구성된 Next.js 파일 컨벤션을 그대로 따른다. 이 네 파일은 세트로 취급하고, 상태 처리(로딩/404/에러) 로직을 추가할 때 App Router 컨벤션 파일 대신 페이지 내부에서 직접 분기하지 않는다.
- `src/lib/quotes/` — 견적서 도메인 로직 전용 디렉터리.
  - `types.ts` — `Quote`, `QuoteItem` 타입과 `quoteTotal()` 순수 함수.
  - `notion.ts` — Notion API 호출(`fetchNotionQuote`). 파일 최상단에 `import "server-only"`가 있으므로 클라이언트 컴포넌트에서 import 금지.
  - `demo.ts` — `/quote/demo`용 하드코딩된 샘플 데이터(`demoQuote`).
  - `index.ts` — 외부에 노출하는 유일한 진입점(`getQuote`, 타입 re-export). **다른 파일에서 `src/lib/quotes/notion` 또는 `src/lib/quotes/demo`를 직접 import하지 말고 반드시 `@/lib/quotes`(index.ts)를 통해서만 import한다.**
- `src/components/quote/` — 견적서 렌더링 전용 컴포넌트(`quote-document.tsx` 서버 컴포넌트, `print-button.tsx` 클라이언트 컴포넌트). 이 디렉터리의 컴포넌트는 `Quote` 타입에만 의존하고 Notion 관련 타입(`NotionPage` 등)을 직접 참조하지 않는다.
- `src/components/layout/`, `src/components/ui/`, `src/components/theme-*` — 스타터킷 공통 레이어. CLAUDE.md에 정의된 계층(Foundation → Primitives → Overlays → Composite Blocks → Layout Templates → Pages)을 유지한다.

## Notion 연동 규칙 (`src/lib/quotes/notion.ts`)

- Notion 프로퍼티 이름은 한글 리터럴 키로 하드코딩되어 있으며, 테스트 DB 실측으로 확정된 아래 스키마를 따른다(`ROADMAP.md` D-03/D-04/D-06 확정, 2026-08-22).
  - `invoices` DB: `"견적서 번호"`(title), `"클라이언트명"`(rich_text), `"발행일"`(date), `"유효기간"`(date), `"상태"`(status: 대기/거절/승인), `"총 금액"`(number), `"항목"`(relation → `items` DB)
  - `items` DB: `"항목명"`(title), `"수량"`(number), `"단가"`(number), `"금액"`(formula, `수량 * 단가`)
  - 공급자 정보 프로퍼티는 테스트 DB에 없으므로 매핑하지 않는다(MVP 범위 제외 확정). `Quote` 타입에 `provider` 필드를 다시 추가하지 않는다.
  - Notion 데이터베이스 스키마가 실제로 바뀌지 않는 한 이 키 이름을 임의로 바꾸지 않는다. 바꿔야 한다면 `docs/PRD.md`의 데이터 사전과 동기화하고 `ROADMAP.md` D-03 항목에 반영한다.
- `상태` 프로퍼티(status 타입) 값이 `"승인"`이 아니면(`"대기"`/`"거절"` 포함) `null`을 반환해 404로 처리하는 게이트가 있다(`fetchNotionQuote` 내부). 이 게이트를 우회하거나 조건을 완화하는 변경은 하지 않는다(승인되지 않은 견적서 노출 방지). 옛 표현인 `"발행됨"`은 더 이상 사용하지 않는다.
- `항목`(라인 아이템)은 `invoices`의 `"항목"` relation으로 연결된 `items` DB를 `databases.query`(`filter: { property: "invoices", relation: { contains: <견적서페이지ID> } }`)로 조회해 가져온다. `has_more`/`next_cursor` 기반 페이지네이션으로 전량 수집해야 하며, Rich Text JSON 파싱 방식으로 되돌리지 않는다.
- Notion API 호출에는 항상 `next: { revalidate: 300 }`(5분 재검증)을 유지한다(items 조회처럼 POST 요청인 경우 `cache: "force-cache"`를 함께 명시해야 opt-in 캐싱된다). Next.js 16 캐싱은 opt-in이므로, 캐시 옵션을 제거하거나 무조건 `no-store`로 바꾸지 않는다. 캐시 전략을 바꿔야 하면 `node_modules/next/dist/docs/`의 16.x 캐싱 문서를 먼저 확인한다.
- `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 서버 전용 환경변수다. `NEXT_PUBLIC_` 접두사를 붙이거나 클라이언트 컴포넌트/브라우저로 노출하는 코드를 작성하지 않는다. 새 환경변수를 추가하면 `.env.example`에도 주석과 함께 추가한다.
- `fetchNotionQuote`가 실패 시 `null`을 반환하는 경우(존재하지 않음/미승인)와 `throw`하는 경우(5xx 등 upstream 오류)를 구분하고 있다. 이 구분을 유지해 `page.tsx`의 `notFound()` 흐름과 `error.tsx`의 오류 경계 흐름이 각각 올바르게 걸리도록 한다.

## 견적서 라우트/URL 규칙

- 현재 `/quote/[id]`의 `id`는 Notion 페이지 ID를 그대로 사용한다(PRD 권고안인 공개 토큰이 아직 아님, `ROADMAP.md` D-08/D-09 미정 상태). 이 사실을 알고 있는 상태에서, 토큰화 작업을 지시받지 않은 이상 URL에 Notion ID를 그대로 노출하는 현재 구조를 "보안 이슈"로 임의 리팩터링하지 않는다 — 별도 작업 지시가 있을 때만 진행한다.
- 데모 라우팅은 `id === "demo"` 문자열 분기로 `getQuote()`(`src/lib/quotes/index.ts`) 안에 하드코딩되어 있다. 데모 경로를 변경/추가할 때는 이 분기와 `src/lib/quotes/demo.ts`를 함께 수정한다.
- `/quote/[id]/page.tsx`의 `metadata`에는 `robots: { index: false, follow: false }`가 고정되어 있다. 견적서는 비공개 문서이므로 이 설정을 제거하거나 완화하지 않는다.

## 헤더 내비게이션 동기화

- `src/components/layout/header.tsx`의 `navLinks` 배열이 데스크톱 내비게이션과 `MobileNav`(`src/components/layout/mobile-nav.tsx`) 양쪽의 단일 소스다. 새 최상위 라우트(예: `src/app/<route>/page.tsx`)를 추가해 메뉴 노출이 필요하면 **`navLinks` 배열도 함께 수정**한다. `MobileNav` 컴포넌트 자체에 링크를 별도로 하드코딩하지 않는다.

## 금액/날짜 표시 규칙

- 통화 포맷은 `src/components/quote/quote-document.tsx`의 `Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 })`로 고정되어 있다. 다중 통화 지원은 `ROADMAP.md` D-11(MVP는 KRW만, 확정)에서 다루므로 별도 지시 없이 통화 포맷을 확장하지 않는다.
- 합계는 Notion의 `"총 금액"` 필드(invoices, 발행자 입력값)를 신뢰하지 않고 `quoteTotal()`(`src/lib/quotes/types.ts`)이 라인 아이템에서 직접 계산한다(`ROADMAP.md` D-05 미정, 서버 검산 도입 전까지 이 방식 유지). `"총 금액"`을 그대로 읽어와 표시하는 방식으로 바꾸거나, 이 둘을 비교 검산하는 로직을 임의로 추가하지 않는다(별도 지시 필요).
- 날짜는 `QuoteItem`이 아니라 `Quote.issueDate`/`Quote.validUntil`에 `YYYY-MM-DD` 문자열로 저장되고, 화면 표시는 `displayDate()`(`quote-document.tsx`)가 담당한다. 새로운 날짜 필드를 추가할 때도 동일하게 `YYYY-MM-DD` 문자열 규약과 `Intl.DateTimeFormat("ko-KR", { dateStyle: "long" })` 포맷을 재사용한다.

## PDF/인쇄 규칙

- PDF 저장은 서버 렌더링이 아니라 `window.print()`(`src/components/quote/print-button.tsx`)를 사용하는 브라우저 인쇄 방식이다(`ROADMAP.md` D-07, MVP는 브라우저 인쇄로 제안 상태). 별도 지시 없이 서버사이드 PDF 생성 라이브러리를 도입하지 않는다.
- 인쇄 시 숨길 요소에는 `print-hidden` 클래스를 사용한다(`print-button.tsx` 예시 참고). 인쇄 전용 CSS는 `src/app/globals.css`에서 관리하며, A4 레이아웃과 관련된 스타일을 개별 컴포넌트에 인라인으로 흩뿌리지 않는다.

## shadcn/ui (`base-nova`) 관련 특이사항

- `src/components/ui/*`는 Radix 기반이 아니라 Base UI(`@base-ui/react`) 기반이다. 인터넷의 일반적인 shadcn(Radix) 예제를 그대로 복사하지 않는다.
- 새 primitive 컴포넌트는 `npx shadcn@latest add <component>`로만 추가한다. `src/components/ui/*` 파일을 수동으로 새로 작성하지 않는다.
- 트리거에 커스텀 요소를 넣을 때는 `asChild`가 아니라 `render` prop을 사용한다(예: `<DialogTrigger render={<Button variant="outline" />}>텍스트</DialogTrigger>`).
- 아이콘은 `lucide-react`만 사용한다(`components.json`의 `iconLibrary: "lucide"`).

## 코딩 컨벤션 (프로젝트 고유 부분)

- 들여쓰기 2칸, 주석/문서는 한국어, 변수명은 camelCase 영어 — 위반 시 반드시 수정.
- Prettier 설정(`semi: true`, double quote, `printWidth: 80`)은 `.prettierrc.json`이 소스이며 `eslint-config-prettier`로 ESLint와 충돌을 제거해 두었다. ESLint 설정(`eslint.config.mjs`)에 포맷 관련 규칙을 새로 추가하지 않는다.
- `next.config.ts`에서 `reactCompiler: true`가 활성화되어 있다. `useMemo`/`useCallback`/`React.memo`를 수동으로 추가하지 않는다.
- Server-only 모듈(`src/lib/quotes/notion.ts` 등)에는 `import "server-only";`를 최상단에 유지한다. 새로 Notion/비밀키를 다루는 모듈을 추가할 때도 동일하게 적용한다.
- `PageProps<"경로">`/`LayoutProps<"경로">` 전역 헬퍼 타입을 사용하고 `params`는 `await`으로 해소한다(`src/app/quote/[id]/page.tsx` 참고). `params`/`searchParams`를 수동으로 타이핑하지 않는다.

## 여러 파일을 함께 수정해야 하는 경우

| 변경 내용                          | 함께 확인/수정할 파일                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 새 최상위 라우트 추가 및 메뉴 노출 | `src/app/<route>/page.tsx` 생성 + `src/components/layout/header.tsx`의 `navLinks`                                                                 |
| Notion 프로퍼티 매핑 변경          | `src/lib/quotes/notion.ts` + `docs/PRD.md` 데이터 사전 + `ROADMAP.md` D-03/D-04 상태                                                              |
| `Quote`/`QuoteItem` 필드 추가·변경 | `src/lib/quotes/types.ts` + `src/lib/quotes/notion.ts`(매핑) + `src/lib/quotes/demo.ts`(샘플) + `src/components/quote/quote-document.tsx`(렌더링) |
| 견적서 상태(로딩/404/에러) UX 변경 | `src/app/quote/[id]/loading.tsx` / `not-found.tsx` / `error.tsx` 중 해당 파일만 수정, 서로 역할을 침범하지 않음                                   |
| 환경변수 추가                      | 실제 사용 코드 + `.env.example`                                                                                                                   |
| shadcn primitive 추가              | `npx shadcn@latest add` 실행 후 `components.json`의 `aliases` 규칙에 맞게 import 경로(`@/components/ui/*`) 사용                                   |

## AI 의사결정 기준

- Notion 스키마, 토큰/보안, 합계·통화, PDF 방식 등 `ROADMAP.md` "8. 의사결정 및 미확정 항목 추적" 표에 "미정"/"제안 상태"로 남아있는 항목을 임의로 확정 짓는 코드 변경(예: 공개 토큰 시스템을 새로 설계해 도입)은 사용자의 명시적 지시 없이 시작하지 않는다. 먼저 해당 결정이 필요하다는 점을 알리고 지시를 기다린다.
- 견적서 도메인 로직(`src/lib/quotes/*`)과 UI 표시(`src/components/quote/*`)를 수정할 때 요구사항이 모호하면 `docs/PRD.md`를 우선 근거로 삼고, PRD에도 없으면 `ROADMAP.md`의 해당 단계 설명을 근거로 삼는다.
- `src/components/ui/*`를 대규모로 손대야 할 것 같으면, 먼저 `npx shadcn@latest diff`로 CLI 재적용이 가능한지 확인하고, 정말 필요한 경우에만 수동 편집한다.

## 금지 사항

- `src/lib/quotes/notion.ts`, `src/lib/quotes/demo.ts`를 `@/lib/quotes/index`(즉 `@/lib/quotes`)를 거치지 않고 다른 모듈에서 직접 import하지 않는다.
- `NOTION_API_KEY`를 로그, 클라이언트 코드, 에러 메시지, 커밋에 노출하지 않는다.
- `상태 !== "발행됨"` 게이트를 삭제/완화해 미발행 견적서를 노출시키지 않는다.
- `/quote/[id]`의 `robots` 메타데이터를 인덱싱 허용으로 바꾸지 않는다.
- `src/components/ui/*` 파일을 shadcn CLI 없이 대규모로 새로 작성하지 않는다.
- Radix UI 전용 API(`asChild` 등)를 이 프로젝트의 `base-nova`(Base UI) 컴포넌트에 그대로 적용하지 않는다.
- 이미 알려진 MVP 이전 상태의 한계(공개 토큰 미구현 등)를 "버그"로 간주해 사용자 지시 없이 임의로 큰 구조 변경을 하지 않는다.
