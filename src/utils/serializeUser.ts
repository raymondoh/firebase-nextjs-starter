// // src/utils/serializeUser

// import type { User, SerializedUser } from "@/types/user";
// import { parseServerDate } from "@/utils/date-server"; // or wherever this is defined

// export function serializeUser(user: User): SerializedUser {
//   return {
//     ...user,
//     createdAt: parseServerDate(user.createdAt)?.toISOString() ?? "",
//     lastLoginAt: parseServerDate(user.lastLoginAt)?.toISOString() ?? "",
//     updatedAt: parseServerDate(user.updatedAt)?.toISOString() ?? ""
//   };
// }
// src/utils/serializeUser.ts
import type { User, SerializedUser } from "@/types/user";
import { parseServerDate } from "@/utils/date-server";

export function serializeUser(user: User): SerializedUser {
  return {
    ...user,
    createdAt: parseServerDate(user.createdAt)?.toISOString(),
    updatedAt: parseServerDate(user.updatedAt)?.toISOString(),
    lastLoginAt: parseServerDate(user.lastLoginAt)?.toISOString()
  };
}

export function serializeUserArray(users: User[]): SerializedUser[] {
  return users.map(serializeUser);
}
