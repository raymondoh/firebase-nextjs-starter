import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Basic logging only for development
  if (process.env.NODE_ENV === "development") {
    console.log("Middleware - Path accessed:", request.nextUrl.pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
