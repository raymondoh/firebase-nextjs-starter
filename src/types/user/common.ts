// types/user/common.ts
import { ActionResponse } from "../common";

// User roles
export type UserRole = "user" | "admin";

// Basic user type
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User-specific action response
 */
export interface UserActionResponse extends ActionResponse {
  // User-specific fields can be added here
}
