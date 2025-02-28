import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
//import { ProfileForm } from "@/components";
//import { NotificationsForm } from "@/components";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account settings and preferences" />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information and how others see you on the platform.
          </p>
        </div>
        <Separator />
        {/* <ProfileForm /> */}
      </div>
      <div className="space-y-6 mt-8">
        <div>
          <h3 className="text-lg font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">Configure how you receive notifications and updates.</p>
        </div>
        <Separator />
        {/* <NotificationsForm /> */}
      </div>
    </DashboardShell>
  );
}
