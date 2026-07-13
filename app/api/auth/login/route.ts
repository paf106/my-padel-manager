import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!checkCredentials(username, password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    if (from && from !== "/") url.searchParams.set("from", from);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await createSessionToken();
  const destination = from.startsWith("/") ? from : "/";
  const response = NextResponse.redirect(new URL(destination, request.url), {
    status: 303,
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "development",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
