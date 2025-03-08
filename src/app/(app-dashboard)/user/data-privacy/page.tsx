"use client";

import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { DataExport } from "@/components/dashboard/DataExport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DataPrivacyPage() {
  const handleDeleteRequest = () => {
    toast.success("Account deletion request submitted", {
      description: "We'll process your request and send confirmation to your email."
    });
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Data & Privacy" text="Manage your personal data and privacy settings" />
      <Separator className="mb-8" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Data Export Section */}
        <DataExport />

        {/* Account Deletion Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Delete Account</CardTitle>
            <CardDescription>Permanently delete your account and all associated data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-red-800">Warning: This action cannot be undone</p>
                <p className="text-sm text-red-700">
                  Deleting your account will permanently remove all your data, including profile information, activity
                  history, and preferences. You will not be able to recover this information later.
                </p>
              </div>
            </div>
            <Button variant="destructive" className="gap-2" onClick={handleDeleteRequest}>
              <Trash2 className="h-4 w-4" />
              Request Account Deletion
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
