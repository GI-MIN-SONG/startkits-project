# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

Next.js App Router 기반 모던 웹 스타터킷. Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 / shadcn/ui(`base-nova` 스타일) / lucide-react / next-themes로 구성되어 있으며, 바로 개발을 시작할 수 있는 레이아웃 셸(Header/Footer/MobileNav)과 다크모드가 갖춰져 있다.

## 명령어

```bash
npm run dev            # 개발 서버 실행 (Turbopack)
npm run build           # 프로덕션 빌드
npm run start            # 프로덕션 서버 실행
npm run lint             # ESLint 검사
npm run format           # Prettier로 전체 파일 포맷팅
npm run format:check     # Prettier 포맷 검사만 수행
```

테스트 프레임워크는 설정되어 있지 않다. 타입 검사만 별도로 하려면 `npx tsc --noEmit`을 사용한다.

Next.js 16부터 `next dev`/`next build`는 기본적으로 Turbopack을 사용한다(별도 `--turbopack` 플래그 불필요).

### CI 게이트 기준

이 저장소에는 커밋 전 자동 실행되는 pre-commit 훅이나 CI 워크플로가 없다. 코드를 변경한 뒤에는 다음 명령을 수동으로 실행해 통과를 확인한다.

```bash
npm run lint          # ESLint
npx tsc --noEmit       # 타입 검사
npm run build          # 프로덕션 빌드
npm run format:check   # Prettier 포맷 검사
```

단위·통합·E2E 테스트 도구는 아직 도입되지 않았다(`ROADMAP.md` 단계 1 "출시 전 보완 필요" 항목). 어떤 도구(Vitest/Jest, Playwright 등)를 쓸지는 미확정 상태이며, 별도 지시 없이 임의로 설치하지 않는다.

## 아키텍처

### shadcn/ui 스타일: `base-nova` (Radix 아님)

`components.json`의 `style`은 `base-nova`로, **Radix UI가 아닌 [Base UI](https://base-ui.com)(`@base-ui/react`) 기반**이다. 인터넷에서 흔히 보이는 Radix 기반 shadcn 예제 코드를 그대로 복사해 붙여넣으면 기존 컴포넌트의 API(`asChild` 대신 `render` prop 사용 등)와 어긋나 동작하지 않는다.

- 새 컴포넌트는 반드시 CLI로 추가한다: `npx shadcn@latest add <component>`
- 트리거에 커스텀 요소를 렌더링할 때는 `asChild`가 아니라 `render` prop을 사용한다. 예: `<DialogTrigger render={<Button variant="outline" />}>텍스트</DialogTrigger>`
- 아이콘 라이브러리는 `lucide-react`로 고정(`components.json`의 `iconLibrary: "lucide"`)

### 컴포넌트 계층 구조

`src/components/`는 재사용성과 의존 방향에 따라 계층화되어 있다. 새 UI를 만들 때는 아래 순서를 따라 하위 계층을 조합해 상위 계층을 구성한다.

1. **Foundation** — `src/app/globals.css`의 디자인 토큰(CSS 변수), `src/lib/utils.ts`의 `cn()`, `cva`
2. **Primitives** — `src/components/ui/*` (shadcn CLI로만 생성/수정. 수동 편집 지양)
3. **Overlays & Feedback** — Dialog, Sheet, DropdownMenu, Tooltip, Popover, Sonner(Toast) — 모두 Primitives에 포함되지만 클라이언트 상태를 가진 상호작용 컴포넌트군
4. **Composite Blocks** — `src/components/layout/*`(Container, Header, Footer, MobileNav), `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx` — Primitives를 조합한 재사용 단위
5. **Layout Templates** — `src/app/layout.tsx`가 Header/Footer/ThemeProvider/TooltipProvider/Toaster를 조합해 만드는 실제 페이지 셸
6. **Pages** — `src/app/**/page.tsx`

견적서 도메인(`src/lib/quotes/*`, `src/components/quote/*`)은 이 계층 중 각각 **Foundation 옆의 별도 도메인 로직 레이어**(`src/lib/quotes/*` — Notion 연동·타입·순수 함수)와 **Composite Blocks**(`src/components/quote/*` — `Quote` 타입에만 의존하는 렌더링 컴포넌트)에 해당한다. `src/lib/quotes`는 반드시 `index.ts`를 유일한 진입점으로 import한다. 상세 규칙은 `shrimp-rules.md`를 참조한다.

### Tailwind CSS v4 (CSS-first, config 파일 없음)

`tailwind.config.ts`는 존재하지 않는다. `src/app/globals.css`가 `@theme inline` 블록으로 디자인 토큰(`--color-*`, `--radius-*`, `--font-*`)을 정의하고, `:root`/`.dark`에서 oklch 색상 변수를 매핑한다. 다크모드는 `@custom-variant dark (&:is(.dark *))`로 클래스 기반 전략을 쓴다.

### 다크모드

`src/components/theme-provider.tsx`가 `next-themes`를 `attribute="class"`로 래핑하고, `src/app/layout.tsx`의 `<html>`에 `suppressHydrationWarning`이 필수로 붙어 있다(클라이언트에서 테마 클래스를 주입하므로 SSR/CSR mismatch 경고 방지). 토글 UI는 `src/components/theme-toggle.tsx`(DropdownMenu 기반, 라이트/다크/시스템 3-way).

### 네비게이션

헤더 메뉴 목록은 `src/components/layout/header.tsx`의 `navLinks` 배열이 단일 소스이며, `MobileNav`(`src/components/layout/mobile-nav.tsx`)에 `links` prop으로 그대로 전달된다. 새 라우트를 추가하면 `src/app/<route>/page.tsx`를 만든 뒤 이 배열에도 반영해야 메뉴에서 접근 가능하다.

### `PageProps`/`LayoutProps` 전역 헬퍼 타입 (Next.js 16 breaking change)

`params`/`searchParams`를 직접 타이핑하지 않고 Next.js가 자동 생성하는 전역 헬퍼 타입을 라우트 경로 리터럴과 함께 사용한다. 예: `src/app/layout.tsx`의 `RootLayout(props: LayoutProps<"/">)`. 동적 라우트를 추가할 때도 `PageProps<"/blog/[slug]">`처럼 실제 경로를 제네릭에 넘기며, `params`는 `Promise`이므로 `await`으로 풀어써야 한다.

## 코딩 컨벤션

- 들여쓰기 2칸, 주석/문서는 한국어, 변수명은 camelCase 영어 (전역 규칙)
- Prettier: `semi: true`, double quote, `printWidth: 80` (`.prettierrc.json`). `eslint-config-prettier`로 ESLint와 포맷 규칙 충돌을 제거해 두었으므로 lint 규칙에 포맷 스타일을 추가하지 않는다.
- `src/components/ui/*` 파일은 shadcn CLI 산출물이므로 직접 대규모로 고치기보다 CLI 재설치나 `npx shadcn@latest diff`로 관리하는 것을 우선한다.
- `next.config.ts`에서 `reactCompiler: true`가 켜져 있다(`babel-plugin-react-compiler` 사용). `useMemo`/`useCallback`/`memo`를 수동으로 추가하지 않아도 컴파일러가 최적화하므로 불필요한 메모이제이션 코드를 작성하지 않는다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
