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

  const nonce = crypto.randomUUID();
  const isDev = process.env.NODE_ENV === "development";
  const csp = `
  default-src 'self';
  script-src 'self' ${
    isDev ? "'unsafe-inline' 'unsafe-eval'" : `'nonce-${nonce}'`
  } https://apis.google.com https://*.gstatic.com https://*.firebaseio.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://*.googleusercontent.com https://*.google.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com;
  frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  response.headers.set("X-CSP-Nonce", nonce);

  if (publicRoutes.has(path)) return response;

  if (process.env.NODE_ENV === "development") {
    console.log(`Middleware - Path accessed: ${path}`);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
