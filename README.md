# 모던 웹 스타터킷

Next.js App Router 기반으로 바로 개발을 시작할 수 있도록 구성한 스타터킷입니다.

## 기술 스택

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (`base-nova` 스타일, [Base UI](https://base-ui.com) 기반)
- [lucide-react](https://lucide.dev) 아이콘
- [next-themes](https://github.com/pacocoursey/next-themes) 다크모드

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 스크립트

| 명령어                 | 설명                        |
| ---------------------- | --------------------------- |
| `npm run dev`          | 개발 서버 실행              |
| `npm run build`        | 프로덕션 빌드               |
| `npm run start`        | 프로덕션 서버 실행          |
| `npm run lint`         | ESLint 검사                 |
| `npm run format`       | Prettier로 전체 파일 포맷팅 |
| `npm run format:check` | Prettier 포맷 검사만 수행   |

## 컴포넌트 추가하기

새 shadcn 컴포넌트는 반드시 CLI로 추가합니다.

```bash
npx shadcn@latest add <component>
```

> **주의**: 이 프로젝트는 `base-nova` 스타일(Radix가 아닌 [Base UI](https://base-ui.com) 기반)을 사용합니다. 인터넷에서 흔히 볼 수 있는 Radix 기반 shadcn 예제 코드를 그대로 복사해 붙여넣으면 기존 컴포넌트와 API가 어긋나 동작하지 않습니다. 항상 CLI로 설치하세요.

## 폴더 구조 및 컴포넌트 계층

```
src/
├── app/                    # 라우트, 레이아웃, 전역 스타일
│   ├── layout.tsx          # Header + Footer + Theme/Toast 프로바이더 조합
│   ├── page.tsx            # 홈 페이지
│   └── globals.css         # 디자인 토큰(Tailwind v4 CSS-first 설정)
├── components/
│   ├── ui/                 # shadcn CLI로 설치되는 원자 컴포넌트
│   ├── layout/              # Header, Footer, MobileNav, Container
│   ├── theme-provider.tsx  # next-themes 래퍼
│   └── theme-toggle.tsx    # 라이트/다크/시스템 전환 드롭다운
└── lib/
    └── utils.ts             # cn() 클래스 병합 헬퍼
```

컴포넌트는 재사용성과 의존 방향에 따라 아래 계층으로 나뉩니다.

1. **Foundation** — `globals.css`의 디자인 토큰, `cn()`, `cva`
2. **Primitives** — `components/ui`의 shadcn 원자 컴포넌트(Button, Input, Card 등)
3. **Overlays & Feedback** — Dialog, Sheet, DropdownMenu, Tooltip, Popover, Sonner
4. **Composite Blocks** — Primitives를 조합한 `components/layout`, `theme-*` 컴포넌트
5. **Layout Templates** — `app/layout.tsx`가 Header/Footer/Provider를 조합한 실제 페이지 셸
6. **Pages** — 각 라우트의 `page.tsx`

새로운 화면을 만들 때는 이미 설치된 Primitives를 조합해 Composite Block을 만들고, 필요하면 `app/` 아래 새 라우트에서 사용하는 순서를 권장합니다.
