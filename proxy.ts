import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_USER_HEADER = "x-padel-auth-user";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(AUTH_USER_HEADER);
  const responseCookies: Array<{
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }> = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          responseCookies.push(...cookiesToSet);
        },
      },
    },
  );
  const { data: claims } = await supabase.auth.getClaims();
  const user = claims?.claims?.sub ? claims.claims : null;
  const isLogin = request.nextUrl.pathname === "/login";
  if (!user && !isLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (user && isLogin) return NextResponse.redirect(new URL("/", request.url));
  if (user) requestHeaders.set(AUTH_USER_HEADER, String(user.sub));
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  responseCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
