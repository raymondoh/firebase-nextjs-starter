import { getToken } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { UserRole } from "@/types/user";

// Ensure role type is safe
const isValidRole = (role: unknown): role is UserRole => role === "admin" || role === "user";

export async function getServerAuthSession(req: Request): Promise<Session | null> {
  const token = await getToken({ req });

  if (!token?.email || !token?.uid) return null;

  return {
    user: {
      id: token.uid,
      email: token.email,
      name: token.name ?? "",
      image: token.picture ?? undefined,
      bio: token.bio ?? "",
      role: isValidRole(token.role) ? token.role : "user"
    },
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() // 30 days
  };
}
