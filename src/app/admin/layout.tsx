import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

import { logoutAction } from "../admin-login/actions";

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | 관리자" },
  robots: { index: false, follow: false },
};

// D-V1-01 확정(환경변수 비밀번호 + httpOnly 쿠키 + middleware): 실제 인증 검사는
// middleware.ts가 담당한다. 이 레이아웃은 인증된 화면 안에서 로그아웃 진입점만 제공한다.
// 전역 Header/ThemeProvider는 루트 레이아웃(src/app/layout.tsx)에서 이미 감싸고 있으므로
// 여기서는 관리자 영역 공통 여백만 추가한다.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <div className="mb-4 flex justify-end">
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            로그아웃
          </Button>
        </form>
      </div>
      {children}
    </div>
  );
}
