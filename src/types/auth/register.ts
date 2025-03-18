import { AuthActionResponse } from "./common";
import { UserRole } from "../user/common";

// REGISTRATION
export type RegisterState =
  | (AuthActionResponse & {
      userId?: string;
      email?: string;
      role?: UserRole;
      requiresVerification: boolean;
      password: string;
    })
  | null;
