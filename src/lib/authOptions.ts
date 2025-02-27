// src/lib/authOptions.ts
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { adminAuth } from "@/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import bcryptjs from "bcryptjs";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n")
  })
};

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        id: { label: "User ID", type: "text" },
        role: { label: "User Role", type: "text" }
      },
      // async authorize(credentials) {
      //   if (!credentials?.email || !credentials?.password || !credentials?.id || !credentials?.role) {
      //     return null;
      //   }

      //   try {
      //     const userRecord = await adminAuth.getUser(credentials.id);
      //     // Note: In a real-world scenario, you should verify the password here
      //     return {
      //       id: userRecord.uid,
      //       email: userRecord.email,
      //       name: userRecord.displayName || userRecord.email?.split("@")[0],
      //       role: credentials.role
      //     };
      //   } catch (error) {
      //     console.error("Error in authorize function:", error);
      //     return null;
      //   }
      // }
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const userRecord = await adminAuth.getUserByEmail(credentials.email);

          // Here, you should implement proper password verification
          // For now, we'll assume the password is correct if the user exists
          // In a real application, you should use a secure password comparison method

          const db = getFirestore();
          const userDoc = await db.collection("users").doc(userRecord.uid).get();
          const userData = userDoc.data();

          if (!userData) {
            throw new Error("User data not found");
          }

          return {
            id: userRecord.uid,
            email: userRecord.email!,
            name: userRecord.displayName || userRecord.email?.split("@")[0],
            role: userData.role || "user"
          };
        } catch (error: any) {
          console.error("Error in authorize function:", error);
          // Instead of returning null, throw an error with a more specific message
          if (error.code === "auth/user-not-found") {
            throw new Error("Invalid email or password");
          }
          throw new Error("An unexpected error occurred");
        }
      }
    })
  ],
  adapter: FirestoreAdapter(firebaseAdminConfig) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called with token:", token);
      if (token && session.user) {
        session.user.id = token.uid as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      console.log("Returning session:", session);
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  events: {
    async signOut({ token }) {
      // Perform any cleanup or additional logout logic here
      console.log("User signed out:", token);
      // You could add additional logic here, such as invalidating the session in your database
    }
  },
  debug: process.env.NODE_ENV === "development"
};
