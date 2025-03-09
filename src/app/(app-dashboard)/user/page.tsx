"use client";

import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Welcome back! Here's an overview of your account." />
      <Separator className="mb-8" />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Account Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Your account status and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p>Free Plan</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p>August 2023</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                  <p>Today, 2:30 PM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Security Status</p>
                  <p className="text-green-600">Secure</p>
                </div>
              </div>
              <div className="pt-4">
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href="/user/profile">
                    Manage Profile <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <ActivityLog limit={3} showFilters={false} showHeader={true} />
      </div>
    </DashboardShell>
  );
}
