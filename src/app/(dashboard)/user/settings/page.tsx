import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components";

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text=" Manage your account settings and preferences." />
      <div className="space-y-6">
        <Separator />
        <ProfileForm />
      </div>
    </DashboardShell>
  );
}
