// import { Separator } from "@/components/ui/separator";
// import { DashboardShell, DashboardHeader } from "@/components";
// import { ActivityPageClient } from "@/components";
// import { auth } from "@/auth";
// import { redirect } from "next/navigation";

// export default async function ActivityPage() {
//   // Get the session server-side
//   const session = await auth();

//   // Redirect if not authenticated
//   if (!session?.user) {
//     redirect("/login");
//   }

//   return (
//     <DashboardShell>
//       <DashboardHeader heading="Activity Log" text="View your recent account activity and security events." />
//       <Separator className="mb-8" />

//       {/* Added a container with overflow handling */}
//       <div className="w-full max-w-full overflow-hidden">
//         <ActivityPageClient />
//       </div>
//     </DashboardShell>
//   );
// }
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ActivityPageClient } from "@/components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import type { SerializedActivity } from "@/types/firebase/activity";

export default async function ActivityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const result = await fetchActivityLogs({ limit: 10 });
  const initialLogs: SerializedActivity[] = Array.isArray(result) ? result : [];

  return (
    <DashboardShell>
      <DashboardHeader heading="Activity Log" text="View your recent account activity and security events." />
      <Separator className="mb-8" />

      <div className="w-full max-w-full overflow-hidden">
        <ActivityPageClient initialLogs={initialLogs} />
      </div>
    </DashboardShell>
  );
}
