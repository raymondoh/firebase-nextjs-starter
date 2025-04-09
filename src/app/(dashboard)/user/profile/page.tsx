// app/(dashboard)/user/profile/page.tsx

import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserProfileForm } from "@/components/auth/UserProfileForm";
import { getCurrentUser } from "@/firebase/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  // Run these in parallel for better performance
  const [session, userResult] = await Promise.all([auth(), getCurrentUser()]);

  if (!session?.user) {
    redirect("/login");
  }

  // Extract the user data or set to null if unsuccessful
  const user = userResult.success ? userResult.data : null;

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and profile information" />
      <Separator className="mb-8" />

      <div className="w-full max-w-4xl overflow-hidden">
        <div className="profile-form-container">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <p className="text-muted-foreground mb-6">Update your personal details and profile picture.</p>

          <UserProfileForm user={user} isLoading={!user} />
        </div>
      </div>
    </DashboardShell>
  );
}
