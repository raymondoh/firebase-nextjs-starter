"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminActivityLogClient } from "@/components";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import type { SerializedActivity } from "@/types/firebase/activity";
import type { ActivityPageClientProps } from "@/types/dashboard/activity";
import { firebaseError } from "@/utils/firebase-error";

export function AdminActivityPageClient({ initialData = [] }: ActivityPageClientProps) {
  const [activities, setActivities] = useState<SerializedActivity[]>(initialData);
  const [loading, setLoading] = useState(!initialData.length);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [activeType, setActiveType] = useState<string | undefined>();

  useEffect(() => {
    if (!initialData.length) {
      loadActivities();
    }
  }, [pageSize, activeType]);

  const loadActivities = async (reset = true) => {
    try {
      setIsRefreshing(true);
      const params = { limit: pageSize, type: activeType };
      const data = await fetchActivityLogs(params);

      if (Array.isArray(data)) {
        reset ? setActivities(data) : setActivities(prev => [...prev, ...data]);
        setHasMore(data.length === pageSize);
        setError(null);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err: unknown) {
      const message = firebaseError(err as any); // optionally wrap this with a `safeFirebaseError` helper
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!activities.length) return;
    setIsRefreshing(true);

    try {
      const lastActivity = activities[activities.length - 1];
      const params = {
        limit: pageSize,
        startAfter: lastActivity.id,
        type: activeType
      };

      const data = await fetchActivityLogs(params);
      if (Array.isArray(data)) {
        setActivities(prev => [...prev, ...data]);
        setHasMore(data.length === pageSize);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err: unknown) {
      const message = firebaseError(err as any);
      setError(message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setActiveType(value === "all" ? undefined : value);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
  };

  const activityTypes = [
    { label: "All Activities", value: "all" },
    { label: "Logins", value: "login" },
    { label: "Logouts", value: "logout" },
    { label: "Registrations", value: "registration" },
    { label: "Password Resets", value: "password_reset" },
    { label: "Profile Updates", value: "profile_update" },
    { label: "Email Verifications", value: "email_verification" },
    { label: "Settings Changes", value: "settings_change" },
    { label: "Deletions", value: "deletion_completed" }
  ];

  return (
    <div className="space-y-6">
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
                {[5, 10, 25, 50].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" onClick={() => loadActivities(true)} disabled={isRefreshing} className="h-10">
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card className="p-6">
        {loading && !isRefreshing ? (
          <p className="text-muted-foreground text-sm">Loading activity logs...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No activity found.</p>
        ) : (
          <>
            <AdminActivityLogClient activities={activities} showFilters={false} isRefreshing={isRefreshing} />
            {hasMore && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={loadMore} disabled={isRefreshing}>
                  {isRefreshing ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
