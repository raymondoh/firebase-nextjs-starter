import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader, UserProfileForm } from "@/components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and profile information" />
      <Separator className="mb-8" />

      <div className="max-w-4xl ml-0">
        <div className="profile-form-container">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <p className="text-muted-foreground mb-6">Update your personal details and profile picture.</p>

          <UserProfileForm id="profile-form" redirectAfterSuccess="/user" />
        </div>
      </div>
    </DashboardShell>
  );
}
