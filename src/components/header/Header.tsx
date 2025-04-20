// "use client";

// import { usePathname } from "next/navigation";
// import { Navbar } from "@/components/header/Navbar";

// export function Header() {
//   const pathname = usePathname();

//   // Don't render the header on auth pages
//   if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) {
//     return null;
//   }

//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container px-4 mx-auto">
//         <Navbar />
//       </div>

//       {/* Add global styles for the menu buttons */}
//       <style jsx global>{`
//         /* Increase hamburger menu size */
//         button[aria-label="Open menu"] svg,
//         button[aria-label="Toggle menu"] svg {
//           width: 28px !important;
//           height: 28px !important;
//         }

//         /* Increase close button size in sheet */
//         [data-radix-collection-item][role="button"] svg {
//           width: 24px !important;
//           height: 24px !important;
//         }
//       `}</style>
//     </header>
//   );
// }
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
