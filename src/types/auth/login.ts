// types/auth/login.ts
//import { ActionResponse } from "../common";
import { UserRole } from "../user/common";

export type LoginState = {
  success?: boolean;
  message?: string;
  error?: string;
  userId?: string;
  email?: string;
  role?: UserRole; // Use UserRole enum here
  customToken?: string;
  emailVerified?: boolean;
} | null;
