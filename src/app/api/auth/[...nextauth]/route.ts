// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // Import from auth.ts

// import NextAuth from "next-auth";
// import { authOptions } from "@/lib/authOptions";
// import type { NextRequest } from "next/server";

export const { GET, POST } = handlers; // Export the handlers

// export async function GET(req: NextRequest) {
//   console.log("🔁 Session API called via GET:", req.url);
//   return NextAuth(authOptions);
// }

// export async function POST(req: NextRequest) {
//   console.log("🔁 Session API called via POST:", req.url);
//   return NextAuth(authOptions);
// }
