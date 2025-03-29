// types/auth/common.ts
import { ActionResponse } from "../common/response";
import { UserRole } from "../user/common";

/**
 * Auth-specific action response
 */
export interface AuthActionResponse extends ActionResponse {
  // No need to redeclare properties that already exist in ActionResponse
  // You can add auth-specific properties here if needed in the future
  userId?: string;
  email?: string;
  //role?: string | UserRole;
  role?: UserRole;
  errors?: Record<string, string>;
}

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
