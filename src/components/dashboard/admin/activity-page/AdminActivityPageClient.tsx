"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminActivityLogClient } from "./AdminActivityLogClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SerializedActivity } from "@/types/firebase/activity";

interface ActivityPageClientProps {
  initialLogs: SerializedActivity[];
}

export function AdminActivityPageClient({ initialLogs }: ActivityPageClientProps) {
  const [activities, setActivities] = useState<SerializedActivity[]>(initialLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [activeType, setActiveType] = useState<string | undefined>();

  const handleTypeChange = (value: string) => {
    setActiveType(value === "all" ? undefined : value);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number.parseInt(value, 10));
  };

  const handleRefresh = () => {
    // Optionally refetch data from the server if needed
    // Currently a no-op since logs are static in initial render
    console.log("Refresh clicked");
  };

  const activityTypes = [
    { label: "All Activities", value: "all" },
    { label: "Logins", value: "login" },
    { label: "Logouts", value: "logout" },
    { label: "Registrations", value: "registration" },
    { label: "Password Resets", value: "password_reset" },
    { label: "Profile Updates", value: "profile_update" },
    { label: "Email Verifications", value: "email_verification" },
    { label: "Settings Changes", value: "settings_change" }
  ];

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select value={activeType || "all"} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-32">
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}>
            <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9" />
            <path d="M21 3v9h-9" />
          </svg>
          Refresh
        </Button>
      </div>

      <Card className="p-4 sm:p-6 w-full overflow-hidden">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No activity found.</p>
        ) : (
          <div className="w-full overflow-hidden">
            <AdminActivityLogClient activities={activities} showFilters={false} isRefreshing={isRefreshing} />
            {hasMore && (
              <div className="mt-6 text-center">
                <Button variant="outline" disabled>
                  Load More (Static)
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
