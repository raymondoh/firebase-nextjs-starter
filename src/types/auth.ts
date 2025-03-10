import type { UserRole } from "./user";

// Common response type for auth actions
// export type AuthActionResponse = {
//   success: boolean;
//   error?: string;
//   message?: string;
// };
export interface AuthActionResponse {
  success: boolean;
  message: string;
}
export enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

// LOGIN
export type LoginState =
  | (AuthActionResponse & {
      userId?: string;
      role?: UserRole;
    })
  | null;

// REGISTRATION
// Update the RegisterState type to match your previous definition
export type RegisterState =
  | (AuthActionResponse & {
      userId?: string;
      email?: string;
      role?: UserRole;
    })
  | null;

// FORGOT PASSWORD (Request Reset)
export type ForgotPasswordState = AuthActionResponse | null;

// RESET PASSWORD (After clicking email link)
export type ResetPasswordState = AuthActionResponse | null;

// UPDATE PASSWORD (For logged-in users)
export type UpdatePasswordState = AuthActionResponse | null;

// User profile type
export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
