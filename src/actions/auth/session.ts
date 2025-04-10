"use server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { cookies } from "next/headers";

// Functions: getSessionInfo, validateSession
// These functions are used to get the current session info and validate the session.
// The getSessionInfo function is used to get the current session info, including whether the user is authenticated and the user object.
// The validateSession function is used to check if the session is valid, including whether the user is authenticated and the session token is valid.

// Get current session info
export async function getSessionInfo(): Promise<{
  isAuthenticated: boolean;
  user: Session["user"] | null;
}> {
  const session = await auth();
  return {
    isAuthenticated: !!session?.user,
    user: session?.user || null
  };
}

// Check if session is valid
export async function validateSession() {
  const session = await auth();
  const cookieStore = await cookies(); // Await the promise here!
  const sessionToken = cookieStore.get("next-auth.session-token");

  return {
    valid: !!session?.user && !!sessionToken,
    expires: session?.expires || null
  };
}
