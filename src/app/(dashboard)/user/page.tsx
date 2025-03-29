// app/(dashboard)/user/page.tsx

import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserActivityPreview } from "@/components/dashboard/user/overview/UserActivityPreview";
import { UserAccountPreview } from "@/components/dashboard/user/overview/UserAccountPreview";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";
import { parseServerDate } from "@/utils/date-server";
import type { User, SerializedUser } from "@/types/user";
import { serializeUser } from "@/utils/serializeUser";

export default async function UserDashboardOverviewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Start with session values and fallback structure
  let userData: User = {
    id: userId,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image ?? "",
    role: session.user.role,
    emailVerified: session.user.emailVerified ?? false,
    hasPassword: false,
    has2FA: false,
    createdAt: new Date(), // fallback
    lastLoginAt: new Date(), // fallback
    updatedAt: new Date() // fallback
  };

  try {
    const doc = await adminDb.collection("users").doc(userId).get();

    if (doc.exists) {
      const firestoreData = doc.data() as Partial<User>;

      userData = {
        ...userData,
        ...firestoreData,
        createdAt: parseServerDate(firestoreData.createdAt) ?? new Date(),
        lastLoginAt: parseServerDate(firestoreData.lastLoginAt) ?? new Date(),
        updatedAt: parseServerDate(firestoreData.updatedAt) ?? new Date(),
        hasPassword: !!firestoreData.passwordHash || firestoreData.provider !== "google",
        has2FA: firestoreData.has2FA ?? false
      };
    }
  } catch (error) {
    console.error("Error fetching Firestore user:", error);
    // Continue with fallback session data
  }

  const serializedUserData: SerializedUser = serializeUser(userData);
  const userName = serializedUserData.name || serializedUserData.email?.split("@")[0] || "User";

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text={`Welcome back, ${userName}! Here's an overview of your account.`} />
      <Separator className="mb-8" />

      <div className="grid gap-8 md:grid-cols-2">
        <UserAccountPreview userData={serializedUserData} />
        <UserActivityPreview
          limit={5}
          showFilters={false}
          showHeader={true}
          showViewAll={true}
          viewAllUrl="/user/activity"
        />
      </div>
    </DashboardShell>
  );
}
