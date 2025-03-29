// types/user/admin.ts

import { UserRole } from "./common";

// USER DATA
export type UserData = {
  email: string;
  passwordHash?: string;
  role?: UserRole;
  // Add any other Firestore fields here
};
