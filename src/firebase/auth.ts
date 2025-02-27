// src/firebase/auth.ts
"use server";

import { adminAuth } from "./admin";
import { createUserDocument, getUserRole } from "./user";
import { auth } from "@/auth";
import type { User, UserRole } from "@/types/user";

// Add these types
type DecodedIdToken = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
};

type VerifyAndCreateUserResult = {
  success: boolean;
  uid?: string;
  error?: string;
};

type GetUserFromTokenResult = {
  success: boolean;
  user?: DecodedIdToken;
  error?: string;
};

type SendResetPasswordEmailResult = {
  success: boolean;
  error?: string;
};

export async function verifyAndCreateUser(token: string): Promise<VerifyAndCreateUserResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    await createUserDocument(decodedToken.uid, {
      id: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
      image: decodedToken.picture || "",
      role: "user"
    });

    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, error: "Invalid token" };
  }
}

export async function getUserFromToken(token: string): Promise<GetUserFromTokenResult> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error("Error getting user from token:", error);
    return { success: false, error: "Invalid token" };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const role = await getUserRole(session.user.id);
  return {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || "",
    role: role as UserRole
  };
}

export async function sendResetPasswordEmail(email: string): Promise<SendResetPasswordEmailResult> {
  try {
    await adminAuth.generatePasswordResetLink(email);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: "Failed to send reset email" };
  }
}
