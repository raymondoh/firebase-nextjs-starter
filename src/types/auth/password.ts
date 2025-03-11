import { AuthActionResponse } from "./common";

// FORGOT PASSWORD (Request Reset)
export type ForgotPasswordState = AuthActionResponse | null;

// RESET PASSWORD (After clicking email link)
export type ResetPasswordState = AuthActionResponse | null;

// UPDATE PASSWORD (For logged-in users)
export type UpdatePasswordState = AuthActionResponse | null;
