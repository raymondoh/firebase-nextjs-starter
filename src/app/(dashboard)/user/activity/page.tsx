import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ActivityPageClient } from "@/components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Activity Log" text="View your recent account activity and security events." />
      <Separator className="mb-8" />

      <ActivityPageClient />
    </DashboardShell>
  );
}
