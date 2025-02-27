// src/types/auth.ts
import { UserRole } from "./user";

export type RegisterResult = {
  success: boolean;
  message?: string;
  error?: string;
  userId?: string;
  email?: string;
  role?: UserRole;
};

export type LoginResult = {
  success: boolean;
  message: string;
  userId?: string;
  role?: UserRole;
};
