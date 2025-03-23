"use client";

import type React from "react";

import { WelcomeProvider } from "@/contexts/welcome-context";
import { useWelcome } from "@/contexts/welcome-context";
import { WelcomeMessage } from "@/components";

interface LayoutWithWelcomeProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: LayoutWithWelcomeProps) {
  return (
    <WelcomeProvider>
      <WelcomeContent>{children}</WelcomeContent>
    </WelcomeProvider>
  );
}

function WelcomeContent({ children }: { children: React.ReactNode }) {
  const { showWelcome, userInfo, dismissWelcome } = useWelcome();

  return (
    <>
      {children}
      {showWelcome && <WelcomeMessage username={userInfo.username} email={userInfo.email} onDismiss={dismissWelcome} />}
    </>
  );
}
