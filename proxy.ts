import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Public routes (no session required).
const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  // Authenticated user hitting /login -> go home.
  if (isPublic && authed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected route without a session -> go to /login.
  if (!isPublic && !authed) {
    const loginUrl = new URL("/login", request.url);
    if (request.nextUrl.search) {
      loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
    } else if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect everything except static assets and the API login/logout endpoints.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
