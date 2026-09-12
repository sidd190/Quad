import { auth } from "./auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api",
  "/oauth",
  "/.well-known",
  "/docs",
  "/developers",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
