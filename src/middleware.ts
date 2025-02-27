// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to public routes without further checks
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Check if the route starts with /admin
  if (path.startsWith("/admin")) {
    // If there's no token or the user is not an admin, redirect to unauthorized page
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/not-authorized", request.url));
    }
  }

  // Check if the route starts with /user
  if (path.startsWith("/user")) {
    // If there's no token, redirect to login page
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // For all other routes, we'll let the server components handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
