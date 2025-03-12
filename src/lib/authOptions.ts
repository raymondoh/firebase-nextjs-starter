// import type { NextAuthConfig } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { FirestoreAdapter } from "@auth/firebase-adapter";
// import { cert } from "firebase-admin/app";
// import { adminAuth } from "@/firebase/admin";
// import { getFirestore } from "firebase-admin/firestore";
// import bcryptjs from "bcryptjs"; // Import bcryptjs for password comparison

// const firebaseAdminConfig = {
//   credential: cert({
//     projectId: process.env.FIREBASE_PROJECT_ID!,
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n")
//   })
// };

// export const authOptions: NextAuthConfig = {
//   basePath: "/api/auth", // Add this line explicitly
//   providers: [
//     GoogleProvider({
//       clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//         id: { label: "User ID", type: "text" },
//         role: { label: "User Role", type: "text" },
//         isRegistration: { label: "Is Registration", type: "text" } // Add isRegistration flag
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Email and password are required");
//         }

//         // Check if this is a registration attempt
//         const isRegistration = credentials.isRegistration === "true";

//         try {
//           // For registration, we'll skip the user lookup since the user doesn't exist yet
//           if (isRegistration && credentials.id) {
//             console.log("Registration attempt detected with ID, returning user data");
//             return {
//               id: credentials.id,
//               email: credentials.email,
//               name: credentials.email.split("@")[0],
//               role: credentials.role || "user",
//               image: null,
//               bio: ""
//             };
//           }

//           // For normal login, proceed with user lookup
//           const userRecord = await adminAuth.getUserByEmail(credentials.email);

//           // Get user data from Firestore
//           const db = getFirestore();
//           const userDoc = await db.collection("users").doc(userRecord.uid).get();
//           const userData = userDoc.data();

//           if (!userData) {
//             console.error("User data not found in Firestore for user:", userRecord.uid);
//             throw new Error("User data not found");
//           }

//           // Check if passwordHash exists in user data
//           if (!userData.passwordHash) {
//             console.warn("No password hash found for user:", userRecord.uid);
//             // For users without a password hash (e.g., OAuth users or legacy users),
//             // you might want to handle this differently
//             throw new Error("Invalid email or password");
//           }

//           // Verify the password using bcrypt
//           const isPasswordValid = await bcryptjs.compare(credentials.password, userData.passwordHash);

//           if (!isPasswordValid) {
//             console.log("Password verification failed for user:", userRecord.uid);
//             throw new Error("Invalid email or password");
//           }

//           // If we reach here, password is valid
//           console.log("Password verification successful for user:", userRecord.uid);

//           return {
//             id: userRecord.uid,
//             email: userRecord.email!,
//             name: userRecord.displayName || userRecord.email?.split("@")[0],
//             role: userData.role || "user",
//             image: userData.picture || userRecord.photoURL || null,
//             bio: userData.bio || "" // Include bio in the returned user object
//           };
//         } catch (error: any) {
//           console.error("Error in authorize function:", error);

//           // If this is a registration attempt and the error is user-not-found, that's expected
//           if (isRegistration && error.code === "auth/user-not-found") {
//             console.log("User not found during registration, this is expected");
//             // Return null to let the registration process continue
//             return null;
//           }

//           // Instead of returning null, throw an error with a more specific message
//           if (error.code === "auth/user-not-found") {
//             throw new Error("Invalid email or password");
//           }
//           throw new Error(error.message || "An unexpected error occurred");
//         }
//       }
//     })
//   ],
//   adapter: FirestoreAdapter(firebaseAdminConfig) as any,
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60 // 30 days
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         console.log("JWT callback with user:", user);
//         token.uid = user.id;
//         token.email = user.email;
//         token.name = user.name;
//         token.role = user.role;
//         token.picture = user.image;
//         token.bio = user.bio; // Add bio to the token
//       } else if (token.uid) {
//         // Always fetch fresh user data from Firestore when refreshing the token
//         try {
//           console.log("Refreshing user data for:", token.uid);
//           const db = getFirestore();
//           const userDoc = await db.collection("users").doc(token.uid).get();
//           const userData = userDoc.data();

//           if (userData) {
//             // Update token with fresh data from Firestore
//             token.name = userData.name || token.name;
//             token.role = userData.role || token.role;
//             token.picture = userData.picture || token.picture;
//             token.bio = userData.bio || ""; // Add bio to the token when refreshing
//             console.log("Updated token with fresh data:", token);
//           }
//         } catch (error) {
//           console.error("Error refreshing user data:", error);
//         }
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       console.log("Session callback called with token:", token);
//       if (token && session.user) {
//         session.user.id = token.uid as string;
//         session.user.email = token.email as string;
//         session.user.name = token.name as string;
//         session.user.role = token.role as string;
//         session.user.image = token.picture as string | undefined;
//         session.user.bio = token.bio as string | undefined; // Add bio to the session
//         // Add explicit debugging for the role
//         console.log(`Setting user role in session to: ${token.role}`);
//       }
//       console.log("Returning session:", session);
//       return session;
//     }
//   },
//   pages: {
//     signIn: "/login"
//   },
//   events: {
//     async signOut({ token }) {
//       // Perform any cleanup or additional logout logic here
//       console.log("User signed out:", token);
//       // You could add additional logic here, such as invalidating the session in your database
//     }
//   },
//   debug: process.env.NODE_ENV === "development",
//   cookies: {
//     sessionToken: {
//       name: `next-auth.session-token`,
//       options: {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//         secure: process.env.NODE_ENV === "production"
//       }
//     }
//   }
// };
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { cert } from "firebase-admin/app";
import { adminAuth, adminDb } from "@/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";
import { logActivity } from "@/firebase/utils/activity";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n")
  })
};

export const authOptions: NextAuthConfig = {
  basePath: "/api/auth", // Add this line explicitly
  providers: [
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
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
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
              description: "Logged in",
              status: "success",
              metadata: {
                provider: decodedToken.firebase?.sign_in_provider || "unknown",
                email: email
              }
            });

            return {
              id: uid,
              email: email,
              name: userRecord.displayName || userData.name || email.split("@")[0],
              image: userRecord.photoURL || userData.photoURL || null,
              role: userData.role || "user",
              bio: userData.bio || ""
            };
          }
        } catch (error) {
          console.error("Error verifying Firebase ID token:", error);
          throw new Error("Invalid ID token");
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
        console.log("JWT callback with user:", user);
        token.uid = user.id;
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
    async signOut({ token }) {
      // Perform any cleanup or additional logout logic here
      console.log("User signed out:", token);
      // You could add additional logic here, such as invalidating the session in your database
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
