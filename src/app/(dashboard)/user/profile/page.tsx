import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserProfileForm } from "@/components/auth/UserProfileForm";
import { serializeUser } from "@/utils";
import { getCurrentUser } from "@/firebase/actions";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  // Get the session server-side
  const session = await auth();
  const result = await getCurrentUser(); // or your custom user fetch logic
  const user = result.success ? result.data : null;

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and profile information" />
      <Separator className="mb-8" />

      {/* Added w-full and overflow-hidden for better mobile display */}
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
