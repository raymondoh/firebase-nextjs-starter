//src/lib/authOptions.ts
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterSession } from "@auth/core/adapters";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { adminAuth, adminDb } from "@/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import { logActivity } from "@/firebase";
import { logGoogleActivity } from "@/firebase/analytics/log-google-activity";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
};

export const authOptions: NextAuthConfig = {
  basePath: "/api/auth", // Add this line explicitly
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET
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
          // Fix: Cast idToken to string
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken as string);
          const uid = decodedToken.uid;
          const email = decodedToken.email;

          if (!email) {
            throw new Error("No email found in ID token");
          }

          console.log("Firebase ID token verified for user:", uid);

          // Get user data from Firebase Auth
          const userRecord = await adminAuth.getUser(uid);

          // Check if user exists in Firestore
          const db = getFirestore();
          const userDoc = await db.collection("users").doc(uid).get();

          // If user doesn't exist in Firestore, create a new document
          if (!userDoc.exists) {
            console.log("Creating new user document in Firestore for:", email);

            // Check if this is the first user (to assign admin role)
            const usersSnapshot = await adminDb.collection("users").count().get();
            const isFirstUser = usersSnapshot.data().count === 0;
            const role = isFirstUser ? "admin" : "user";

            // Create user document in Firestore
            const now = new Date();
            await adminDb
              .collection("users")
              .doc(uid)
              .set({
                email: email,
                name: userRecord.displayName || email.split("@")[0],
                role: role,
                photoURL: userRecord.photoURL || null,
                provider: decodedToken.firebase?.sign_in_provider || "unknown",
                createdAt: now,
                updatedAt: now,
                lastLoginAt: now
              });

            // Set custom claims for the user
            await adminAuth.setCustomUserClaims(uid, { role: role });

            // Log activity for new user
            await logActivity({
              userId: uid,
              type: "register",
              description: "Account created",
              status: "success",
              metadata: {
                provider: decodedToken.firebase?.sign_in_provider || "unknown",
                email: email
              }
            });

            return {
              id: uid,
              email: email,
              name: userRecord.displayName || email.split("@")[0],
              image: userRecord.photoURL || null,
              role: role
            };
          } else {
            // User exists, update last login time
            const userData = userDoc.data();

            await adminDb.collection("users").doc(uid).update({
              lastLoginAt: new Date(),
              updatedAt: new Date()
            });

            // Log activity
            await logActivity({
              userId: uid,
              type: "login",
              description: "Logged in with email/password",
              status: "success",
              metadata: {
                provider: decodedToken.firebase?.sign_in_provider || "unknown",
                email: email
              }
            });

            return {
              id: uid,
              email: email,
              // Fix: Add null checks for userData
              name: userRecord.displayName || (userData && userData.name) || email.split("@")[0],
              image: userRecord.photoURL || (userData && userData.photoURL) || null,
              role: (userData && userData.role) || "user",
              bio: (userData && userData.bio) || ""
            };
          }
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
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback with user:", user);
        // Fix: Ensure uid is always a string
        token.uid = user.id || "";
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.picture = user.image;
        token.bio = user.bio; // Add bio to the token
      } else if (token.uid) {
        // Always fetch fresh user data from Firestore when refreshing the token
        try {
          console.log("Refreshing user data for:", token.uid);
          const db = getFirestore();
          const userDoc = await db.collection("users").doc(token.uid).get();
          const userData = userDoc.data();

          if (userData) {
            // Update token with fresh data from Firestore
            token.name = userData.name || token.name;
            token.role = userData.role || token.role;
            token.picture = userData.photoURL || userData.picture || token.picture;
            token.bio = userData.bio || ""; // Add bio to the token when refreshing
            console.log("Updated token with fresh data:", token);
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
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
        session.user.image = token.picture as string | undefined;
        session.user.bio = token.bio as string | undefined; // Add bio to the session
        // Add explicit debugging for the role
        console.log(`Setting user role in session to: ${token.role}`);
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
      if (account?.provider === "google") {
        try {
          const email = user.email ?? "unknown";
          await logGoogleActivity(user.id ?? "unknown-id", email, user.name);
        } catch (error) {
          console.error("Error logging Google sign-in:", error);
        }
      }
    },
    // }
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
