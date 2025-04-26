// src/lib/authOptions.ts
import type { NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { adminAuth, adminDb } from "@/firebase/admin/firebase-admin-init";
import { syncUserWithFirebase } from "./auth/syncUserWithFirebase";
import type { AdapterUser } from "next-auth/adapters";
import { handleProviderSync } from "./auth/sync";
import type { UserRole } from "@/types/user";
type ExtendedUser = AdapterUser & {
  sub?: string;
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
          prompt: "select_account",
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
        if (!credentials?.idToken || typeof credentials.idToken !== "string") {
          throw new Error("Invalid ID token");
        }

        try {
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
          const uid = decodedToken.uid;
          const email = decodedToken.email;

          if (!email) throw new Error("No email in token");

          const userRecord = await adminAuth.getUser(uid);
          const provider = decodedToken.firebase?.sign_in_provider || "unknown";

          const { role } = await syncUserWithFirebase(uid, {
            email,
            name: userRecord.displayName || undefined,
            image: userRecord.photoURL || undefined,
            provider
          });

          return {
            id: uid,
            email,
            name: userRecord.displayName || email.split("@")[0],
            image: userRecord.photoURL || undefined,
            role
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
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        try {
          const { role, uid } = await handleProviderSync(user as ExtendedUser, account);
          token.uid = uid;
          token.role = role;
        } catch (error) {
          console.error(`Error syncing ${account.provider} user with Firebase:`, error);
        }
      }

      const extendedUser = user as ExtendedUser;

      token.email = extendedUser?.email;
      token.name = extendedUser?.name;
      token.picture = extendedUser?.image;
      token.bio = extendedUser?.bio;

      return token;
    },

    async session({ session, token }) {
      const isValidRole = (role: unknown): role is UserRole => role === "admin" || role === "user";

      if (token && session.user) {
        try {
          const [authUser, firestoreDoc] = await Promise.all([
            adminAuth.getUser(token.uid as string),
            adminDb
              .collection("users")
              .doc(token.uid as string)
              .get()
          ]);

          const firestoreData = firestoreDoc.data();

          session.user.id = token.uid as string;
          session.user.email = authUser.email || token.email!;
          session.user.name = authUser.displayName || firestoreData?.name || token.name || "";
          session.user.image = authUser.photoURL || firestoreData?.picture || token.picture;
          session.user.bio = firestoreData?.bio || token.bio || "";
          session.user.role = isValidRole(firestoreData?.role) ? firestoreData.role : "user";
        } catch (err) {
          console.warn("[Session callback] Failed to refresh session from Firebase:", err);

          session.user.id = token.uid as string;
          session.user.email = token.email as string;
          session.user.role = isValidRole(token.role) ? token.role : "user";
          session.user.name = token.name as string;
          session.user.image = token.picture as string | undefined;
          session.user.bio = token.bio as string | undefined;
        }
      }

      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  events: {
    async signIn({ user, account }) {
      console.log(`User signed in with ${account?.provider}:`, user.email);
    },
    async signOut(message) {
      if ("session" in message) {
        console.log("User signed out with session:", message.session);
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
////////////////////////////////////////////////
