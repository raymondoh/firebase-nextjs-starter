import type { User, SerializedUser } from "@/types/user/common";
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
