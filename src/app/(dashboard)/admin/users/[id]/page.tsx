import { DashboardShell, DashboardHeader } from "@/components";
import { AdminUserDetailCard } from "@/components/dashboard/admin";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";
import { serializeData } from "@/utils/serializeData";
import type { Timestamp } from "firebase-admin/firestore";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const currentUserId = session.user.id;
  let isAdmin = false;

  try {
    const userDoc = await adminDb.collection("users").doc(currentUserId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData?.role === "admin";
    }
    if (!isAdmin) {
      redirect("/user/dashboard");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect("/user/dashboard");
  }

  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    redirect("/admin/users");
  }

  const userData = userDoc.data();

  const convertTimestamp = (timestamp: Timestamp | Date | string | number | null | undefined): Date | undefined => {
    if (!timestamp) return undefined;

    if (timestamp instanceof Date) return timestamp;

    if (typeof timestamp === "string" || typeof timestamp === "number") {
      const parsed = new Date(timestamp);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }

    if (typeof timestamp === "object" && "toDate" in timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }

    return undefined;
  };

  const user = {
    id: userDoc.id,
    name: userData?.name,
    email: userData?.email,
    role: userData?.role || "user",
    emailVerified: userData?.emailVerified || false,
    status: userData?.status || "active",
    createdAt: convertTimestamp(userData?.createdAt),
    lastLoginAt: convertTimestamp(userData?.lastLoginAt),
    updatedAt: convertTimestamp(userData?.updatedAt),
    image: userData?.image || userData?.picture,
    has2FA: userData?.has2FA || false,
    hasPassword: userData?.hasPassword || false
  };

  const serializedUser = serializeData(user);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="User Details"
        text={`View and manage details for ${serializedUser.name || serializedUser.email || "user"}.`}
      />
      <Separator className="mb-8" />

      {/* Added a container with overflow handling */}
      <div className="w-full max-w-full overflow-hidden">
        <AdminUserDetailCard user={serializedUser} />
      </div>
    </DashboardShell>
  );
}
