/**
 * Auth Types Index
 *
 * This file explicitly exports all auth-related types from the auth directory.
 * Using this index file makes imports clearer and helps with IDE auto-imports.
 */

// Common auth types
export type { AuthActionResponse, UserProfile } from "./common";

// Login types
export type { LoginState } from "./login";

// Registration types
export type { RegisterState } from "./register";

// Password management types
export type { ForgotPasswordState, ResetPasswordState, UpdatePasswordState } from "./password";

// Re-export all types (alternative approach)
// export * from "./common";
// export * from "./login";
// export * from "./register";
// export * from "./password";
