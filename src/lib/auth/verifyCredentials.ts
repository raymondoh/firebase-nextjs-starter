// src/lib/auth/verifyFirebaseCredentials.ts
import { adminAuth } from "@/firebase/admin/firebase-admin-init";
import { syncUserWithFirebase } from "./syncUserWithFirebase";

export async function verifyFirebaseCredentials(idToken: string) {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const email = decodedToken.email;

  if (!email) {
    throw new Error("No email found in ID token");
  }

  console.log("Firebase ID token verified for user:", uid);

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
}
