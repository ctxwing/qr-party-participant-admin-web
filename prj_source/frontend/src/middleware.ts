import { nextMiddleware } from "better-auth/next-js";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 경로 보호 (/admin)
  // 로그인 페이지(/admin/login)는 제외
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }).then((res) => res.json()).catch(() => null);

    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // API 관리자 경로 보호 (/api/admin)
  if (pathname.startsWith("/api/admin")) {
    const session = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }).then((res) => res.json()).catch(() => null);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
