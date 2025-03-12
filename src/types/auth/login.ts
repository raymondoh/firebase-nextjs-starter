// types/auth/login.ts
import { ActionResponse } from "../common";
import { UserRole } from "../user/common";

// export type LoginState =
//   | (ActionResponse & {
//       userId?: string;
//       role?: UserRole;
//     })
//   | null;
export interface LoginState {
  success?: boolean;
  message?: string;
  error?: string;
  userId?: string;
  email?: string;
  role?: string;
  customToken?: string;
}
