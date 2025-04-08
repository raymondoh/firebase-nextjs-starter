"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <UserProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </UserProvider>
    </SessionProvider>
  );
}
