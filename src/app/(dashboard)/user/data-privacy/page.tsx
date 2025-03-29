"use client";

import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { DataExport } from "@/components/dashboard/user/data-privacy/DataExport";
import { AccountDeletion } from "@/components/dashboard/user/data-privacy/AccountDeletion";

export default function DataPrivacyPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Data & Privacy" text="Manage your personal data and privacy settings" />
      <Separator className="mb-8" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Data Export Section */}
        <DataExport />

        {/* Account Deletion Section */}
        <AccountDeletion />
      </div>
    </DashboardShell>
  );
}
