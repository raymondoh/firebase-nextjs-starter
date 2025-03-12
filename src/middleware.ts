import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/not-authorized", "/error"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Create the response
  const response = NextResponse.next();

  // Add the Content Security Policy header to all responses
  response.headers.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.googleapis.com https://*.gstatic.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https://*.googleusercontent.com https://*.google.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://*.googleapis.com https://*.google.com https://firestore.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com;
      frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
    `
      .replace(/\s+/g, " ")
      .trim()
  );

  // Add Cross-Origin-Opener-Policy header
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // Allow access to public routes without further checks
  if (publicRoutes.includes(path)) {
    return response;
  }

  // We're moving authorization to the layout components
  // This middleware now only logs the path for debugging
  console.log(`Middleware - Path accessed: ${path}`);

  // Let all requests through - authorization will be handled by layouts
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
