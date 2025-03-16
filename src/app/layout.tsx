import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "@/components/ui/sonner";
import { Header, Footer } from "@/components";
//import { ToasterProvider } from "@/providers/ToasterProvider";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});
export const metadata: Metadata = {
  title: "Firebase Boilerplate",
  description: "A Next.js Firebase boilerplate",
  // Add CSP meta tag
  other: {
    "content-security-policy": `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.googleapis.com https://*.gstatic.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https://*.googleusercontent.com https://*.google.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://*.googleapis.com https://*.google.com https://firestore.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com;
      frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
    `
      .replace(/\s+/g, " ")
      .trim(),
    "cross-origin-opener-policy": "same-origin-allow-popups"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <UserProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </ThemeProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
