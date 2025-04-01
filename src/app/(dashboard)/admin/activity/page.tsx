import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { AdminActivityPageClient } from "@/components";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Activity Log - Admin",
  description: "View all recent activity across the platform."
};

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

      {/* Added a container with overflow handling */}
      <div className="w-full max-w-full overflow-hidden">
        <AdminActivityPageClient />
      </div>
    </DashboardShell>
  );
}
