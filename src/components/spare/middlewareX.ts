import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const path = request.nextUrl.pathname;

  console.log("Middleware running for path:", path);

  // Allow access to public routes without authentication
  if (publicRoutes.includes(path)) {
    // If user is already authenticated, redirect them away from public routes
    if (session) {
      const redirectPath = session.user.role === "admin" ? "/admin" : "/user";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if there's no session for non-public routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control for admin routes
  if (path.startsWith("/admin")) {
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Access control for user routes
  if (path.startsWith("/user")) {
    if (!["user", "admin"].includes(session.user.role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};
