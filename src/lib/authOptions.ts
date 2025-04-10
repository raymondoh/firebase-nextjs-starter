//src/lib/authOptions.ts
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterSession } from "@auth/core/adapters";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { adminAuth } from "@/firebase/admin";
import { syncUserWithFirebase } from "./syncUserWithFirebase";
import type { UserRole } from "@/types/user";

type ExtendedUser = {
  id?: string;
  sub?: string;
  email?: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  bio?: string;
};

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
};

export const authOptions: NextAuthConfig = {
  basePath: "/api/auth",
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // Default to showing account selection
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          throw new Error("No ID token provided");
        }

        try {
          // Verify the ID token using Firebase Admin
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken as string);
          const uid = decodedToken.uid;
          const email = decodedToken.email;

          if (!email) {
            throw new Error("No email found in ID token");
          }

          console.log("Firebase ID token verified for user:", uid);

          // Get user data from Firebase Auth
          const userRecord = await adminAuth.getUser(uid);

          // Sync user with Firebase using our utility function
          const provider = decodedToken.firebase?.sign_in_provider || "unknown";
          const { role } = await syncUserWithFirebase(uid, {
            email: email,
            name: userRecord.displayName || undefined, // Changed from null to undefined
            image: userRecord.photoURL || undefined, // Changed from null to undefined
            provider: provider
          });

          return {
            id: uid,
            email: email,
            name: userRecord.displayName || email.split("@")[0],
            image: userRecord.photoURL || undefined, // Changed from null to undefined
            role: role
          };
        } catch (error) {
          console.error("Error verifying Firebase ID token:", error);
          throw new Error("Invalid ID token");
        }
      }
    })
  ],
  adapter: FirestoreAdapter(firebaseAdminConfig) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        console.log("JWT callback with user:", user);
        console.log("Account info:", account);

        // If this is a sign-in with a provider (like Google)
        if (account) {
          const provider = account.provider || "unknown";

          // For Google auth, we need to handle the user ID differently
          let userId = user.id || "";

          // For Google auth, we might need to use the sub field
          // Cast user to ExtendedUser to access the sub property
          const extendedUser = user as ExtendedUser;
          if (provider === "google" && !userId && extendedUser.sub) {
            userId = extendedUser.sub;
            console.log(`Using Google sub as userId: ${userId}`);
          }

          if (!userId) {
            console.error("No user ID found for authentication");
            return token;
          }

          // Use our syncUserWithFirebase function for all providers
          try {
            console.log(`Syncing user with Firebase. Provider: ${provider}, ID: ${userId}`);
            const { role, uid } = await syncUserWithFirebase(userId, {
              email: user.email || "",
              name: user.name || undefined, // Changed from null to undefined
              image: user.image || undefined, // Changed from null to undefined
              provider: provider,
              providerAccountId: account.providerAccountId // Pass the provider account ID
            });

            // Update token with user data and role from Firebase
            token.uid = uid; // Use the returned UID which might be different
            token.role = role;
            console.log(`User synced successfully. Role: ${role}, UID: ${uid}`);
          } catch (error) {
            console.error(`Error syncing ${provider} user with Firebase:`, error);
          }
        }

        // Set token properties from user object
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.bio = user.bio; // Add bio to the token
      }

      // Rest of the function remains the same
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback called with token:", token);
      const isValidRole = (role: unknown): role is UserRole => role === "admin" || role === "user";

      if (token && session.user) {
        session.user.id = token.uid as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;

        session.user.role = isValidRole(token.role) ? token.role : "user";

        session.user.image = token.picture as string | undefined;
        session.user.bio = token.bio as string | undefined;

        console.log(`Setting user role in session to: ${session.user.role}`);
      }

      console.log("Returning session:", session);
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login" // Add this line to redirect to login page on error
  },
  events: {
    async signIn({ user, account }) {
      // We don't need to handle this here anymore since we're using syncUserWithFirebase in the JWT callback
      console.log(`User signed in with ${account?.provider}:`, user.email);
      console.log("Account details:", account);
    },
    async signOut(
      message: { session: void | AdapterSession | null | undefined } | { token: JWT | null }
    ): Promise<void> {
      if ("session" in message) {
        const session = message.session;

        if (session && typeof session !== "undefined") {
          console.log("User signed out with session:", session);
        } else {
          console.log("Sign out triggered but no session data.");
        }
      }

      if ("token" in message) {
        console.log("User signed out with token:", message.token);
      }
    }
  },
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};
