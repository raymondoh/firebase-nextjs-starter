import { type NextRequest, NextResponse } from "next/server";
import { handleGoogleAuth } from "@/actions/auth/google";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

/**
 * This route handles the callback from Google OAuth
 * It should be called after a successful Google sign-in
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInfo } = body;

    if (!userInfo || !userInfo.email || !userInfo.sub) {
      return NextResponse.json({ error: "Invalid user information" }, { status: 400 });
    }

    // Process the Google authentication
    const result = await handleGoogleAuth(userInfo);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Create a session token
    const token = await encode({
      token: {
        email: result.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: result.userId,
        role: result.role
      },
      secret: process.env.NEXTAUTH_SECRET!
    });

    // Set the session cookie
    cookies().set({
      name: "next-auth.session-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/"
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      user: {
        id: result.userId,
        email: result.email,
        role: result.role
      }
    });
  } catch (error: any) {
    console.error("Error in Google callback:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
