// // src/actions/authActions.ts
// "use server";
// import bcryptjs from "bcryptjs";
// import { cookies } from "next/headers"; // Add this import
// import { rateLimit } from "@/lib/rateLimit";
// import { auth, signIn } from "@/auth";
// import { getFirestore } from "firebase-admin/firestore";
// import { adminAuth, adminDb } from "@/firebase/admin";
// import { loginSchema, forgotPasswordSchema, resetPasswordSchema, updatePasswordSchema } from "@/schemas/auth";
// import type {
//   LoginState,
//   RegisterState,
//   ForgotPasswordState,
//   ResetPasswordState,
//   UpdatePasswordState
// } from "@/types/auth";

// // Helper function to sync password between Firebase Auth and Firestore
// export async function syncPasswordAfterReset(email: string, password: string): Promise<boolean> {
//   try {
//     // First, try to authenticate with Firebase Auth
//     const userRecord = await adminAuth.getUserByEmail(email);

//     // If successful, update the password hash in Firestore
//     const salt = await bcryptjs.genSalt(10);
//     const hashedPassword = await bcryptjs.hash(password, salt);

//     await adminDb.collection("users").doc(userRecord.uid).update({
//       passwordHash: hashedPassword,
//       updatedAt: new Date()
//     });

//     return true;
//   } catch (error) {
//     console.error("Error syncing password after reset:", error);
//     return false;
//   }
// }

// // LOGIN
// export async function loginUser(prevState: LoginState, formData: FormData): Promise<LoginState> {
//   // Validate form data
//   const result = loginSchema.safeParse({
//     email: formData.get("email"),
//     password: formData.get("password")
//   });

//   if (!result.success) {
//     return {
//       success: false,
//       message: "Invalid email or password format"
//     };
//   }

//   const { email, password } = result.data;

//   try {
//     console.log("Attempting to sign in with credentials:", { email });

//     try {
//       // Try to sign in
//       await signIn("credentials", {
//         redirect: false,
//         email,
//         password
//       });
//     } catch (error) {
//       // If login fails, try to sync password and then login again
//       console.log("Initial login failed, attempting to sync password...");
//       const synced = await syncPasswordAfterReset(email, password);

//       if (synced) {
//         // Try login again
//         await signIn("credentials", {
//           redirect: false,
//           email,
//           password
//         });
//       } else {
//         throw error; // Re-throw if sync failed
//       }
//     }

//     // Check if the auth cookie was set
//     const cookieStore = await cookies();
//     const sessionToken = cookieStore.get("next-auth.session-token");

//     console.log("After signIn, session token cookie:", sessionToken ? "exists" : "missing");

//     if (!sessionToken) {
//       return {
//         success: false,
//         message: "Authentication failed - no session created"
//       };
//     }

//     // If we get here, the sign-in was successful
//     return {
//       success: true,
//       message: "Login successful"
//     };
//   } catch (error: any) {
//     console.error("Login error:", error);

//     // Return a user-friendly error message based on the error type
//     return {
//       success: false,
//       message:
//         error.type === "CallbackRouteError"
//           ? "Invalid email or password"
//           : error.message || "An unexpected error occurred"
//     };
//   }
// }

// // REGISTRATION
// export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
//   // Your existing registration code...
//   return { success: true };
// }

// // FORGOT PASSWORD (Request Reset)
// export async function requestPasswordReset(
//   prevState: ForgotPasswordState,
//   formData: FormData
// ): Promise<ForgotPasswordState> {
//   console.log("requestPasswordReset called with formData:", formData ? "exists" : "null");

//   // Check if formData is null or undefined
//   if (!formData) {
//     console.error("FormData is null or undefined");
//     return { success: false, error: "Invalid form submission" };
//   }

//   const email = formData.get("email");
//   console.log("Email extracted from formData:", email);

//   // Check if email is present and is a string
//   if (!email || typeof email !== "string") {
//     console.error("Email is missing from form data or is not a string");
//     return { success: false, error: "Email is required" };
//   }

//   const result = forgotPasswordSchema.safeParse({
//     email
//   });

//   if (!result.success) {
//     console.error("Invalid email format:", result.error);
//     return { success: false, error: "Invalid email format" };
//   }

//   try {
//     console.log("Attempting to generate password reset link for:", email);
//     const actionCodeSettings = {
//       url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
//       handleCodeInApp: true
//     };
//     console.log("Action code settings:", actionCodeSettings);

//     const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
//     console.log("Password reset link generated successfully");

//     return { success: true };
//   } catch (error: any) {
//     console.error("Password reset error:", error);
//     console.error("Error code:", error.code);
//     console.error("Error message:", error.message);
//     if (error.code === "auth/user-not-found") {
//       // For security reasons, we don't want to reveal if the email exists or not
//       return { success: true }; // Pretend it succeeded even if the user doesn't exist
//     }
//     return { success: false, error: "Failed to send password reset email" };
//   }
// }

// // RESET PASSWORD (After clicking email link)
// export async function resetPassword(prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
//   const oobCode = formData.get("oobCode");
//   const newPassword = formData.get("password");
//   const confirmPassword = formData.get("confirmPassword");

//   // Check if values exist and are strings
//   if (!oobCode || typeof oobCode !== "string") {
//     return { success: false, error: "Reset code is required" };
//   }

//   if (!newPassword || typeof newPassword !== "string") {
//     return { success: false, error: "New password is required" };
//   }

//   if (!confirmPassword || typeof confirmPassword !== "string") {
//     return { success: false, error: "Confirm password is required" };
//   }

//   // Validate the form data
//   const result = resetPasswordSchema.safeParse({
//     password: newPassword,
//     confirmPassword: confirmPassword,
//     oobCode
//   });

//   if (!result.success) {
//     const errorMessage = result.error.issues[0]?.message || "Invalid form data";
//     return { success: false, error: errorMessage };
//   }

//   try {
//     // Verify the action code
//     const info = await adminAuth.verifyPasswordResetCode(oobCode);
//     console.log("Reset code verified for email:", info.email);

//     // Update the password in Firebase Auth
//     await adminAuth.confirmPasswordReset(oobCode, newPassword);
//     console.log("Password updated in Firebase Auth");

//     // Hash the new password for Firestore
//     const salt = await bcryptjs.genSalt(10);
//     const hashedPassword = await bcryptjs.hash(newPassword, salt);

//     // Update the password hash in Firestore
//     const userRecord = await adminAuth.getUserByEmail(info.email);
//     await adminDb.collection("users").doc(userRecord.uid).update({
//       passwordHash: hashedPassword,
//       updatedAt: new Date()
//     });
//     console.log("Password hash updated in Firestore");

//     return { success: true };
//   } catch (error: any) {
//     console.error("Error completing password reset:", error);

//     // Provide user-friendly error messages
//     if (error.code === "auth/expired-action-code") {
//       return { success: false, error: "The password reset link has expired. Please request a new one." };
//     } else if (error.code === "auth/invalid-action-code") {
//       return { success: false, error: "The password reset link is invalid. Please request a new one." };
//     } else if (error.code === "auth/weak-password") {
//       return { success: false, error: "The password is too weak. Please choose a stronger password." };
//     }

//     return { success: false, error: "Failed to reset password. Please try again." };
//   }
// }

// // UPDATE PASSWORD (For logged-in users)
// export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
//   const session = await auth();

//   if (!session || !session.user || !session.user.id) {
//     return { success: false, error: "Not authenticated" };
//   }

//   // Safely get form values
//   const currentPassword = formData.get("currentPassword");
//   const newPassword = formData.get("newPassword");
//   const confirmPassword = formData.get("confirmPassword");

//   // Check if values exist and are strings
//   if (!currentPassword || typeof currentPassword !== "string") {
//     return { success: false, error: "Current password is required" };
//   }

//   if (!newPassword || typeof newPassword !== "string") {
//     return { success: false, error: "New password is required" };
//   }

//   if (!confirmPassword || typeof confirmPassword !== "string") {
//     return { success: false, error: "Confirm password is required" };
//   }

//   // Validate the form data
//   const result = updatePasswordSchema.safeParse({
//     currentPassword,
//     newPassword,
//     confirmPassword
//   });

//   if (!result.success) {
//     const errorMessage = result.error.issues[0]?.message || "Invalid form data";
//     return { success: false, error: errorMessage };
//   }

//   try {
//     // Get user data from Firestore to check current password
//     const userDoc = await adminDb.collection("users").doc(session.user.id).get();
//     const userData = userDoc.data();

//     if (!userData || !userData.passwordHash) {
//       return { success: false, error: "User data not found" };
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, userData.passwordHash);
//     if (!isCurrentPasswordValid) {
//       return { success: false, error: "Current password is incorrect" };
//     }

//     // Hash the new password
//     const salt = await bcryptjs.genSalt(10);
//     const newPasswordHash = await bcryptjs.hash(newPassword, salt);

//     // Update password in Firebase Auth
//     await adminAuth.updateUser(session.user.id, {
//       password: newPassword
//     });

//     // Update password hash in Firestore
//     await adminDb.collection("users").doc(session.user.id).update({
//       passwordHash: newPasswordHash,
//       updatedAt: new Date()
//     });

//     return { success: true };
//   } catch (error: any) {
//     console.error("Error updating password:", error);

//     // Provide user-friendly error messages
//     if (error.code === "auth/weak-password") {
//       return { success: false, error: "The password is too weak. Please choose a stronger password." };
//     }

//     return { success: false, error: "Failed to update password. Please try again." };
//   }
// }
"use server";
import bcryptjs from "bcryptjs";
import { cookies } from "next/headers";
import { auth, signIn } from "@/auth";
import { adminAuth, adminDb } from "@/firebase/admin";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, updatePasswordSchema } from "@/schemas/auth";
import type {
  LoginState,
  RegisterState,
  ForgotPasswordState,
  ResetPasswordState,
  UpdatePasswordState
} from "@/types/auth";
import { logActivity } from "@/firebase/activity";

// Helper function to sync password between Firebase Auth and Firestore
export async function syncPasswordAfterReset(email: string, password: string): Promise<boolean> {
  try {
    // First, try to authenticate with Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email);

    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData || !userData.passwordHash) {
      console.error("No user data or password hash found for user:", userRecord.uid);
      return false;
    }

    // Verify the password using bcrypt before syncing
    const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

    if (!isPasswordValid) {
      console.error("Password verification failed during sync for user:", userRecord.uid);
      return false;
    }

    // If password is valid, we don't need to update anything
    console.log("Password verified successfully during sync");
    return true;
  } catch (error) {
    console.error("Error syncing password after reset:", error);
    return false;
  }
}

// LOGIN
export async function loginUser(prevState: LoginState, formData: FormData): Promise<LoginState> {
  // Validate form data
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!result.success) {
    return {
      success: false,
      message: "Invalid email or password format"
    };
  }

  const { email, password } = result.data;

  try {
    console.log("Attempting to sign in with credentials:", { email });

    // First, let's verify the password directly before attempting to sign in
    try {
      // Get user from Firebase Auth
      const userRecord = await adminAuth.getUserByEmail(email);

      // Get user data from Firestore
      const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
      const userData = userDoc.data();

      if (!userData || !userData.passwordHash) {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      // Verify the password using bcrypt
      const isPasswordValid = await bcryptjs.compare(password, userData.passwordHash);

      if (!isPasswordValid) {
        console.log("Password verification failed for user:", userRecord.uid);
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      console.log("Password verified successfully, proceeding with sign in");
    } catch (verifyError: any) {
      console.error("Error verifying password:", verifyError);

      // Handle user not found error
      if (verifyError.code === "auth/user-not-found") {
        return {
          success: false,
          message: "Invalid email or password"
        };
      }

      return {
        success: false,
        message: "An error occurred during authentication"
      };
    }

    // If we get here, the password is valid, so attempt to sign in
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        isRegistration: "false"
      });

      if (result?.error) {
        console.error("SignIn returned error:", result.error);
        return {
          success: false,
          message: "Authentication failed"
        };
      }
    } catch (signInError: any) {
      console.error("Error during signIn:", signInError);
      return {
        success: false,
        message: "Authentication failed"
      };
    }

    // Check if the auth cookie was set
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("next-auth.session-token");

    console.log("After signIn, session token cookie:", sessionToken ? "exists" : "missing");

    if (!sessionToken) {
      return {
        success: false,
        message: "Authentication failed - no session created"
      };
    }

    // If we get here, the sign-in was successful
    return {
      success: true,
      message: "Login successful"
    };
  } catch (error: any) {
    console.error("Login error:", error);

    // Return a user-friendly error message
    return {
      success: false,
      message: error.message || "An unexpected error occurred"
    };
  }
}

// REGISTRATION
export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  // Validate form data
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required"
    };
  }

  try {
    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name || email.split("@")[0] // Use email username as fallback
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "Email already in use. Please try logging in instead."
        };
      }
      throw error;
    }

    // Create user document in Firestore with the hashed password
    await adminDb
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name: name || email.split("@")[0], // Use email username as fallback
        email,
        role: "user",
        passwordHash, // Store the hashed password
        createdAt: new Date()
      });

    // Log activity
    await logActivity({
      userId: userRecord.uid,
      type: "login",
      description: "Account created",
      status: "success"
    });

    // Return the user ID, email, and role along with success message
    return {
      success: true,
      message: "Registration successful!",
      userId: userRecord.uid,
      email: email,
      role: "user"
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration. Please try again."
    };
  }
}

// FORGOT PASSWORD (Request Reset)
export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  console.log("requestPasswordReset called with formData:", formData ? "exists" : "null");

  // Check if formData is null or undefined
  if (!formData) {
    console.error("FormData is null or undefined");
    return { success: false, error: "Invalid form submission" };
  }

  const email = formData.get("email");
  console.log("Email extracted from formData:", email);

  // Check if email is present and is a string
  if (!email || typeof email !== "string") {
    console.error("Email is missing from form data or is not a string");
    return { success: false, error: "Email is required" };
  }

  const result = forgotPasswordSchema.safeParse({
    email
  });

  if (!result.success) {
    console.error("Invalid email format:", result.error);
    return { success: false, error: "Invalid email format" };
  }

  try {
    console.log("Attempting to generate password reset link for:", email);
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true
    };
    console.log("Action code settings:", actionCodeSettings);

    const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    console.log("Password reset link generated successfully");

    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    if (error.code === "auth/user-not-found") {
      // For security reasons, we don't want to reveal if the email exists or not
      return { success: true }; // Pretend it succeeded even if the user doesn't exist
    }
    return { success: false, error: "Failed to send password reset email" };
  }
}

// RESET PASSWORD (After clicking email link)
export async function resetPassword(prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const oobCode = formData.get("oobCode");
  const newPassword = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Check if values exist and are strings
  if (!oobCode || typeof oobCode !== "string") {
    return { success: false, error: "Reset code is required" };
  }

  if (!newPassword || typeof newPassword !== "string") {
    return { success: false, error: "New password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Confirm password is required" };
  }

  // Validate the form data
  const result = resetPasswordSchema.safeParse({
    password: newPassword,
    confirmPassword: confirmPassword,
    oobCode
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || "Invalid form data";
    return { success: false, error: errorMessage };
  }

  try {
    // Verify the action code
    const info = await adminAuth.verifyPasswordResetCode(oobCode);
    console.log("Reset code verified for email:", info.email);

    // Update the password in Firebase Auth
    await adminAuth.confirmPasswordReset(oobCode, newPassword);
    console.log("Password updated in Firebase Auth");

    // Hash the new password for Firestore
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update the password hash in Firestore
    const userRecord = await adminAuth.getUserByEmail(info.email);
    await adminDb.collection("users").doc(userRecord.uid).update({
      passwordHash: hashedPassword,
      updatedAt: new Date()
    });
    console.log("Password hash updated in Firestore");

    return { success: true };
  } catch (error: any) {
    console.error("Error completing password reset:", error);

    // Provide user-friendly error messages
    if (error.code === "auth/expired-action-code") {
      return { success: false, error: "The password reset link has expired. Please request a new one." };
    } else if (error.code === "auth/invalid-action-code") {
      return { success: false, error: "The password reset link is invalid. Please request a new one." };
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "The password is too weak. Please choose a stronger password." };
    }

    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

// UPDATE PASSWORD (For logged-in users)
export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Safely get form values
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  // Check if values exist and are strings
  if (!currentPassword || typeof currentPassword !== "string") {
    return { success: false, error: "Current password is required" };
  }

  if (!newPassword || typeof newPassword !== "string") {
    return { success: false, error: "New password is required" };
  }

  if (!confirmPassword || typeof confirmPassword !== "string") {
    return { success: false, error: "Confirm password is required" };
  }

  // Validate the form data
  const result = updatePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword
  });

  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || "Invalid form data";
    return { success: false, error: errorMessage };
  }

  try {
    // Get user data from Firestore to check current password
    const userDoc = await adminDb.collection("users").doc(session.user.id).get();
    const userData = userDoc.data();

    if (!userData || !userData.passwordHash) {
      return { success: false, error: "User data not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, userData.passwordHash);
    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const newPasswordHash = await bcryptjs.hash(newPassword, salt);

    // Update password in Firebase Auth
    await adminAuth.updateUser(session.user.id, {
      password: newPassword
    });

    // Update password hash in Firestore
    await adminDb.collection("users").doc(session.user.id).update({
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });

    // Log the password change
    await logActivity({
      userId: session.user.id,
      type: "password_change",
      description: "Password changed successfully",
      status: "success"
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating password:", error);

    // Provide user-friendly error messages
    if (error.code === "auth/weak-password") {
      return { success: false, error: "The password is too weak. Please choose a stronger password." };
    }

    return { success: false, error: "Failed to update password. Please try again." };
  }
}

// LOGOUT
export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the current session
    const session = await auth();

    if (session?.user?.id) {
      // Log the logout activity
      await logActivity({
        userId: session.user.id,
        type: "login", // You might want to create a "logout" type
        description: "User logged out",
        status: "success"
      });
    }

    // Perform any additional server-side cleanup here if needed

    // Return success
    return {
      success: true,
      message: "Logged out successfully"
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: "An error occurred during logout"
    };
  }
}
