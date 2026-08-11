import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/sign-in");
  const isPublicPage = pathname.startsWith("/privacy");

  // belum login → hanya redirect kalau bukan halaman login atau publik
  if (!token && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // sudah login → jangan boleh ke login lagi
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)",
  ],
};
