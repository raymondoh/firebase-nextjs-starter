import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { AdminProfileForm } from "@/components/dashboard/admin";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase/admin";

export const metadata: Metadata = {
  title: "Admin Profile - Admin",
  description: "Manage your admin account settings and profile information."
};

export default async function AdminProfilePage() {
  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  const userId = session.user.id;
  let isAdmin = false;

  try {
    // Fetch the user document from Firestore to check admin status
    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData?.role === "admin";
    }

    // Redirect if not an admin
    if (!isAdmin) {
      redirect("/user/dashboard");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    redirect("/user/dashboard");
  }

  //   return (
  //     <DashboardShell>
  //       <DashboardHeader heading="Admin Profile" text="Manage your admin account settings and profile information" />
  //       <Separator className="mb-8" />

  //       <div className="max-w-4xl">
  //         <div className="space-y-6">
  //           <div>
  //             <h2 className="text-xl font-semibold">Personal Information</h2>
  //             <p className="text-muted-foreground">Update your personal details and profile picture.</p>
  //           </div>

  //           <AdminProfileForm redirectAfterSuccess="/admin" />
  //         </div>
  //       </div>
  //     </DashboardShell>
  //   );
  // }
  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Profile" text="Manage your admin account settings and profile information" />
      <Separator className="mb-8" />

      {/* Added w-full and overflow-hidden */}
      <div className="w-full max-w-4xl overflow-hidden">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-muted-foreground">Update your personal details and profile picture.</p>
          </div>

          <AdminProfileForm redirectAfterSuccess="/admin" />
        </div>
      </div>
    </DashboardShell>
  );
}
