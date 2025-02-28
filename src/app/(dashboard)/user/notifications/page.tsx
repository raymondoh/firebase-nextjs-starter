import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { NotificationsForm } from "@/components";

export default function NotificationsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Notifications"
        text="Manage your notification preferences and communication settings."
      />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Notification Settings</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified about activity and updates.
          </p>
        </div>
        <Separator />
        <NotificationsForm />
      </div>
    </DashboardShell>
  );
}
