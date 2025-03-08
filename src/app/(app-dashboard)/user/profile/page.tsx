"use client";

import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader, UserProfileForm } from "@/components";
//import "@/app/profile.css"; // Import the CSS

export default function UserProfilePage() {
  const router = useRouter();

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and profile information" />
      <Separator />

      <div className="max-w-4xl ml-0">
        <div className="profile-form-container">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <p className="text-muted-foreground mb-6">Update your personal details and profile picture.</p>

          <UserProfileForm id="profile-form" onCancel={() => router.push("/user")} />
        </div>
      </div>
    </DashboardShell>
  );
}
