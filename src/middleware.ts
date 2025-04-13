// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/not-authorized",
  "/error",
  "/resend-verification",
  "/verify-email",
  "/verify-success"
]);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  const response = NextResponse.next();

  if (publicRoutes.has(path)) return response;

  if (process.env.NODE_ENV === "development") {
    console.log(`Middleware - Path accessed: ${path}`);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
