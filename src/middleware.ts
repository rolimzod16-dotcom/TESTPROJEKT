import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "hive_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "hive-monitor-dev-secret",
);

const protectedPaths = [
  { path: "/dashboard", login: "/login" },
  { path: "/app/dashboard", login: "/app/login" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = protectedPaths.find((item) => pathname.startsWith(item.path));
  if (!match) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(match.login, request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/app/dashboard/:path*"],
};