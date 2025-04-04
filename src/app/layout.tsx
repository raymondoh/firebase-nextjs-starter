import type React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from "@/components/ui/sonner";
import { Header, Footer } from "@/components";

import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});
// export const metadata: Metadata = {
//   title: {
//     default: siteConfig.name,
//     template: `%s | ${siteConfig.name}`
//   },
//   description: siteConfig.description,
//   keywords: siteConfig.keywords,
//   authors: [{ name: siteConfig.author }],
//   openGraph: {
//     type: "website",
//     locale: "en_US",
//     url: siteConfig.url,
//     title: siteConfig.name,
//     description: siteConfig.description,
//     siteName: siteConfig.name,
//     images: [
//       {
//         url: siteConfig.ogImage,
//         width: 1200,
//         height: 630,
//         alt: siteConfig.name
//       }
//     ]
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: siteConfig.name,
//     description: siteConfig.description,
//     images: [siteConfig.ogImage]
//   }
// };
export const metadata = {
  title: "Firebase Boilerplate",
  description: "A Next.js Firebase boilerplate",
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
}: //auth
Readonly<{
  children: React.ReactNode;
  //auth: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <UserProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <Header />
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                  {children}
                  {/* {auth} */}
                </main>
                <Footer />
              </div>
              <Toaster position="top-center" />
            </ThemeProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
