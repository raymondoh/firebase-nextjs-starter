//import type { User } from "@/types/user";
import { getCurrentUser } from "@/firebase/actions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserProfileForm } from "@/components/auth/UserProfileForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default async function AdminProfilePage() {
  // Run these in parallel for better performance
  const [session, userResult] = await Promise.all([auth(), getCurrentUser()]);

  // Check authentication
  if (!session?.user) {
    redirect("/login");
  }

  // Check if the user is an admin
  if (session.user.role !== "admin") {
    redirect("/not-authorized"); // Redirect non-admin users to not-authorized page
  }

  // Extract the user data or handle error
  const user = userResult.success ? userResult.data : null;
  const error = userResult.success ? null : userResult.error;

  // If we couldn't get the user data, show an error page
  if (!user) {
    redirect("/error");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Profile" text="Update your admin account settings" />
      <Separator className="mb-8" />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="w-full max-w-7xl overflow-hidden">
        <div className="profile-form-container">
          {/* <h2 className="text-xl font-semibold mb-4">Admin Information</h2>
          <p className="text-muted-foreground mb-6">Update your name, bio, and profile image.</p> */}

          <UserProfileForm user={user} isLoading={!user} isAdmin={true} />
        </div>
      </div>
    </DashboardShell>
  );
}
