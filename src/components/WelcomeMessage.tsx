// components/WelcomeMessage.tsx
"use client";

import { useSession } from "next-auth/react";

export default function WelcomeMessage() {
  const { data: session } = useSession();

  if (session) {
    return <p>Welcome back, {session.user.name}!</p>;
  }

  return null;
}
