import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UserActivityPageClient } from "@/components/dashboard/user/activity/UserActivityPageClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import type { SerializedActivity } from "@/types/firebase/activity";

export default async function UserActivityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // ✅ Fetch logs safely
  const result = await fetchActivityLogs({ limit: 10 });
  const initialLogs: SerializedActivity[] = result.success && Array.isArray(result.activities) ? result.activities : [];

  return (
    <DashboardShell>
      <DashboardHeader heading="Activity Log" text="View your recent account activity and security events." />
      <Separator className="mb-8" />

      <div className="w-full max-w-full overflow-hidden">
        <UserActivityPageClient initialLogs={initialLogs} />
      </div>
    </DashboardShell>
  );
}
