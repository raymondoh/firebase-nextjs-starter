"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BasicDashboard } from "@/components/templates";
import { AccountSettingsForm } from "@/components";
import { SecuritySettingsForm } from "@/components";
import { PreferenceSettingsForm } from "@/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const handleCancel = () => {
    router.push("/user");
  };

  const handleSubmitStart = () => {
    setIsSubmitting(true);
  };

  const handleSubmitComplete = (success: boolean) => {
    setIsSubmitting(false);
    if (success) {
      // Optionally show a success message
    }
  };

  return (
    <BasicDashboard title="Settings" description="Manage your account settings and preferences.">
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile information.</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettingsForm
                id="account-settings-form"
                onSubmitStart={handleSubmitStart}
                onSubmitComplete={handleSubmitComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm
                id="security-settings-form"
                onSubmitStart={handleSubmitStart}
                onSubmitComplete={handleSubmitComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Set your preferred theme, language, and other settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <PreferenceSettingsForm
                id="preference-settings-form"
                onSubmitStart={handleSubmitStart}
                onSubmitComplete={handleSubmitComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </BasicDashboard>
  );
}
