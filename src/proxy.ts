import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth/token";

// D-V1-01 확정: /admin/* 접근을 환경변수 비밀번호 기반 세션 쿠키로 보호한다.
// /admin-login 자신은 /admin 하위 경로가 아니므로 matcher에서 자동으로 제외된다.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifySessionToken(token);

  if (!isValid) {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
