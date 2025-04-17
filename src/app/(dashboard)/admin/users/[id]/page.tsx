// src/app/(dashboard)/admin/users/[id]/page.tsx

import { DashboardShell, DashboardHeader } from "@/components";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin/firebase-admin-init";
import { AdminUserTabs } from "@/components/dashboard/admin/users/AdminUserTabs";
import { serializeUser } from "@/utils/serializeUser";

// interface PageProps {
//   params: { id: string };
// }

export default async function AdminUserTabsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  // 1) Ensure user is signed in
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 2) Check current user is an admin
  const currentUserId = session.user.id;
  let isAdmin = false;
  try {
    const currentUserDoc = await adminDb.collection("users").doc(currentUserId).get();
    if (currentUserDoc.exists && currentUserDoc.data()?.role === "admin") {
      isAdmin = true;
    }
    if (!isAdmin) {
      redirect("/user/dashboard");
    }
  } catch (err) {
    console.error("Error checking admin status:", err);
    redirect("/user/dashboard");
  }

  // 3) Fetch the target user
  const userDoc = await adminDb.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    redirect("/admin/users");
  }

  const rawData = { id: userDoc.id, ...(userDoc.data() || {}) };
  const serializedUser = serializeUser(rawData);

  // 4) Render the dashboard shell + tabs
  return (
    <DashboardShell>
      <DashboardHeader
        heading="User Details"
        text={`View and manage details for ${serializedUser.name || serializedUser.email || "user"}.`}
      />
      <Separator className="mb-8" />

      <div className="w-full max-w-full overflow-hidden">
        <AdminUserTabs user={serializedUser} />
      </div>
    </DashboardShell>
  );
}
