"use client";

import { useSession } from "next-auth/react";

export function UserGreeting() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "authenticated" && session?.user) {
    return <p>Welcome back, {session.user.name}!</p>;
  }

  return null;
}
