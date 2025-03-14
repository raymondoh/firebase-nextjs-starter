"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, UserPlus, Calendar } from "lucide-react";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalActivities: number;
}

interface SystemOverviewClientProps {
  systemStats: SystemStats;
}

export function SystemOverviewClient({ systemStats }: SystemOverviewClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Overviewqq</CardTitle>
        <CardDescription>Key metrics about your application</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.activeUsers}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">New Today</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.newUsersToday}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Total Activities</span>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalActivities}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Manage Users
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              System Settings
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
