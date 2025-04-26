"use client";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/header/Navbar";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const excludedPaths = new Set([
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/not-authorized",
    "/error",
    "/resend-verification",
    "/verify-email",
    "/verify-success"
  ]);

  const showMinimalHeader = [...excludedPaths].some(path => pathname.startsWith(path));

  if (showMinimalHeader) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container px-4 py-4 mx-auto flex items-center justify-center">
          <Link href="/">
            <Image src="/fire.svg" alt="Logo" width={50} height={32} priority />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto">
        <Navbar />
      </div>
      {/* global styles */}
    </header>
  );
}
