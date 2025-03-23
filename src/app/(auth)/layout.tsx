import type React from "react";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
//import { Header } from "@/components";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* <Header /> */}
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
