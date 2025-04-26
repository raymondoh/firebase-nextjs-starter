// "use server";

// import bcryptjs from "bcryptjs";
// import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
// import { loginSchema } from "@/schemas/auth";
// import type { LoginResponse } from "@/types/auth/login";
// import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
// import { logServerEvent } from "@/utils/logger";

// export async function loginUser(_prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;
//   const isRegistration = formData.get("isRegistration") === "true";
//   const skipSession = formData.get("skipSession") === "true";

//   // Step 1: Validate input
//   const validation = loginSchema.safeParse({ email, password });
//   if (!validation.success) {
//     return {
//       success: false,
//       message: validation.error.issues[0]?.message || "Invalid form data"
//     };
//   }

//   try {
//     // Step 2: Get user record from Firebase Auth
//     const userRecord = await adminAuth.getUserByEmail(email);
//     const isEmailVerified = userRecord.emailVerified;

//     if (!isEmailVerified && !isRegistration && !skipSession) {
//       return {
//         success: false,
//         message: "Please verify your email before logging in. Check your inbox for a verification link."
//       };
//     }

//     // Step 3: Validate Firestore password hash
//     const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
//     const userData = userDoc.data();

//     if (!userData?.passwordHash) {
//       return { success: false, message: "Invalid email or password" };
//     }

//     const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);
//     if (!isPasswordValid) {
//       return { success: false, message: "Invalid email or password" };
//     }

//     // Step 4: Return custom token for client-side Firebase sign in
//     const customToken = await adminAuth.createCustomToken(userRecord.uid);
//     //console.log("[loginUser] Returning customToken:", customToken);

//     // Inside try block after successful login
//     await logServerEvent({
//       type: "auth:login",
//       message: `User logged in: ${userRecord.email}`,
//       metadata: {
//         uid: userRecord.uid,
//         email: userRecord.email,
//         time: new Date().toISOString()
//       }
//     });

//     return {
//       success: true,
//       message: "Login successful!",
//       data: {
//         userId: userRecord.uid,
//         email,
//         role: userData.role || "user",
//         customToken,
//         emailVerified: isEmailVerified
//       }
//     };
//   } catch (error) {
//     if (isFirebaseError(error)) {
//       if (error.code === "auth/user-not-found") {
//         return { success: false, message: "Invalid email or password" };
//       }

//       return { success: false, message: firebaseError(error) };
//     }
//     await logServerEvent({
//       type: "auth:login_error",
//       message: `Failed login attempt for ${email}`,
//       metadata: {
//         error: isFirebaseError(error) ? error.code : String(error)
//       }
//     });

//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Unexpected login error. Please try again."
//     };
//   }
// }
"use server";

import bcryptjs from "bcryptjs";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { loginSchema } from "@/schemas/auth";
import type { LoginResponse } from "@/types/auth/login";
import { firebaseError, isFirebaseError } from "@/utils/firebase-error";
import { logServerEvent, logger } from "@/utils/logger";

export async function loginUser(_prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const isRegistration = formData.get("isRegistration") === "true";
  const skipSession = formData.get("skipSession") === "true";

  // Step 1: Validate input
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const message = validation.error.issues[0]?.message || "Invalid form data";
    logger({ type: "warn", message: `Login validation failed: ${message}`, context: "auth" });
    return { success: false, message };
  }

  try {
    // Step 2: Get user record
    const userRecord = await adminAuth.getUserByEmail(email);
    const isEmailVerified = userRecord.emailVerified;

    if (!isEmailVerified && !isRegistration && !skipSession) {
      const message = "Please verify your email before logging in. Check your inbox for a verification link.";
      logger({ type: "info", message: `Blocked unverified login: ${email}`, context: "auth" });
      return { success: false, message };
    }

    // Step 3: Validate password hash
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData?.passwordHash) {
      logger({ type: "warn", message: `No passwordHash for ${email}`, context: "auth" });
      return { success: false, message: "Invalid email or password" };
    }

    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);
    if (!isPasswordValid) {
      logger({ type: "warn", message: `Invalid password for ${email}`, context: "auth" });
      return { success: false, message: "Invalid email or password" };
    }

    // Step 4: Return token
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    // Log successful login
    logger({ type: "info", message: `Login success for ${email}`, context: "auth" });
    await logServerEvent({
      type: "auth:login",
      message: `User logged in: ${userRecord.email}`,
      userId: userRecord.uid,
      metadata: {
        uid: userRecord.uid,
        email: userRecord.email,
        time: new Date().toISOString()
      }
    });

    return {
      success: true,
      message: "Login successful!",
      data: {
        userId: userRecord.uid,
        email,
        role: userData.role || "user",
        customToken,
        emailVerified: isEmailVerified
      }
    };
  } catch (error) {
    logger({
      type: "error",
      message: `Login error for ${email}`,
      context: "auth",
      metadata: { error }
    });

    if (isFirebaseError(error)) {
      if (error.code === "auth/user-not-found") {
        return { success: false, message: "Invalid email or password" };
      }
      return { success: false, message: firebaseError(error) };
    }

    await logServerEvent({
      type: "auth:login_error",
      message: `Failed login attempt for ${email}`,
      metadata: {
        error: isFirebaseError(error) ? error.code : String(error)
      }
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected login error. Please try again."
    };
  }
}
