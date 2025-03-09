"use client";

import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ActivityLog } from "@/components/dashboard/ActivityLog";

export default function ActivityPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Activity Log" text="Monitor recent activity and security events on your account" />
      <Separator className="mb-8" />

      <div className="max-w-5xl ml-0">
        <ActivityLog />
      </div>
    </DashboardShell>
  );
}
