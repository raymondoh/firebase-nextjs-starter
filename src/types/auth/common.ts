// types/auth/common.ts
import { ActionResponse } from "../common";
import { UserRole } from "../user/common";

/**
 * Auth-specific action response
 */
export interface AuthActionResponse extends ActionResponse {
  // Auth-specific fields can be added here
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
