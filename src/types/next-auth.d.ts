import type { DefaultSession } from "next-auth";
import type { UserRole } from "./user";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    bio?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      bio?: string;
      image?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: UserRole;
    bio?: string;
  }
}
