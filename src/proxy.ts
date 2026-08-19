import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSession(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("authjs.session-token") || cookie.name.includes("next-auth.session-token"));
}

export function proxy(request: NextRequest) {
  if (hasSession(request)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/clientes",
    "/clientes/:path*",
    "/propostas",
    "/propostas/:path*",
    "/pipeline",
    "/pipeline/:path*",
  ],
};
