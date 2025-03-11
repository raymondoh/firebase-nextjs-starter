// types/auth/login.ts
import { ActionResponse } from "../common";
import { UserRole } from "../user/common";

export type LoginState =
  | (ActionResponse & {
      userId?: string;
      role?: UserRole;
    })
  | null;
