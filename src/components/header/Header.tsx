"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components";

export function Header() {
  const pathname = usePathname();

  // Don't render the header on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto">
        <Navbar />
      </div>
    </header>
  );
}
