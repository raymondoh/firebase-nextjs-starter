import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { AdminActivityPageClient } from "@/components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminActivityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/not-authorized");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Activity Log" text="View all recent activity across the platform." />
      <Separator className="mb-8" />
      <AdminActivityPageClient />
    </DashboardShell>
  );
}
