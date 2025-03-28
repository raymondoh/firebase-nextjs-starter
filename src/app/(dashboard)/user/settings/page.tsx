"use client";

import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ChangePasswordForm } from "@/components/dashboard/user/settings/ChangePasswordForm";
import { NotificationForm } from "@/components/dashboard/user/settings/NotificationForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account settings and security preferences" />
      <Separator className="mb-8" />

      <div className="max-w-4xl ml-0">
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="security" className="px-5">
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-5">
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <div className="profile-form-container">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              <p className="text-muted-foreground mb-6">Update your password and security preferences.</p>
              <ChangePasswordForm />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="profile-form-container">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <p className="text-muted-foreground mb-6">Control which emails you receive from us.</p>
              <NotificationForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
