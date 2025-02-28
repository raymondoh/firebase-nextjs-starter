import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components";

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text=" Update your personal information and how others see you on the platform."
      />
      <div className="space-y-6">
        <Separator />
        <ProfileForm />
      </div>
    </DashboardShell>
  );
}
