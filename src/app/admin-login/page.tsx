import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-3">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground">
            비밀번호를 입력해 관리자 화면에 접근하세요.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
