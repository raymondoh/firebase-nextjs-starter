// types/auth/password.ts
import type { FirebaseError } from "firebase/app";

// This could be in types/auth/index.ts or types/auth/password.ts
export interface ForgotPasswordState {
  success: boolean;
  message?: string;
  error?: string; // Add this line
  // other properties...
}

export interface ResetPasswordState {
  success: boolean;
  message?: string;
  error?: string; // Add this line
  // other properties...
}

export interface UpdatePasswordState {
  success: boolean;
  message?: string;
  error?: string | FirebaseError;
  // other properties...
}
