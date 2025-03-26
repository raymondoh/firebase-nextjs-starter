import { DashboardHeader, NotificationForm } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
export default function UserNotificationsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Notifications" text="Optional description text" />
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          {/* Section content */}
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro eum non minus dolore deleniti, atque antium
            distinctio obcaecati omnis, possimus ex asperiores quae necessitatibus in libero reiciendis est voluptatum.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          {/* Another section */} Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quaerat fugit deserunt
          voluptas nam suscipit ratione aliquam assumenda accusamus,
        </div>
      </div>
      <NotificationForm />
    </DashboardShell>
  );
}
