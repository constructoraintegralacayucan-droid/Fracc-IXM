import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "ixmegallo_admin_session";
const CLIENTE_COOKIE_NAME = "ixmegallo_cliente_session";

async function hasValidSession(request: NextRequest, cookieName: string, kind: string) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.kind === kind;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    if (await hasValidSession(request, ADMIN_COOKIE_NAME, "admin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!(await hasValidSession(request, ADMIN_COOKIE_NAME, "admin"))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/cliente/login") {
    if (await hasValidSession(request, CLIENTE_COOKIE_NAME, "cliente")) {
      return NextResponse.redirect(new URL("/cliente/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/cliente")) {
    if (!(await hasValidSession(request, CLIENTE_COOKIE_NAME, "cliente"))) {
      return NextResponse.redirect(new URL("/cliente/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*"],
};
