"use client";

import type React from "react";
import { ThemeProvider } from "@/providers/ThemeProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </ThemeProvider>
  );
}
