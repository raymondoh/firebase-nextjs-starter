"use client";
//import { connectFirebaseEmulator } from "@/firebase/connectEmulator";
//import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
//import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // useEffect(() => {
  //   connectFirebaseEmulator(); // ✅ Connect emulators when client loads
  // }, []);
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {/* <UserProvider> */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
      {/* </UserProvider> */}
    </SessionProvider>
  );
}
