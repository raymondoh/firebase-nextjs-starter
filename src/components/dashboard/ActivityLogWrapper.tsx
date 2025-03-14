"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityLogClient } from "./ActivityLogClient";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Use the serialized activity type
interface SerializedActivity {
  id: string;
  userId: string;
  type: string;
  description: string;
  status: "success" | "failure";
  timestamp: string; // ISO string
  metadata?: Record<string, any>;
}

interface ActivityLogWrapperProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllUrl?: string;
  className?: string;
}

export function ActivityLogWrapper({
  limit = 5,
  showFilters = true,
  showHeader = true,
  showViewAll = true,
  viewAllUrl = "/user/activity",
  className = ""
}: ActivityLogWrapperProps) {
  const [activities, setActivities] = useState<SerializedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadActivities = async () => {
    try {
      setIsRefreshing(true);
      const data = await fetchActivityLogs(limit);
      console.log("Received activity data:", data);

      // Ensure we have valid data
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        console.error("Invalid data format received:", data);
        setError("Invalid data format received");
      }
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
      setError("Failed to load activity logs");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [limit]);

  const handleRefresh = () => {
    loadActivities();
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent account activity</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
            aria-label="Refresh activity logs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}>
              <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9" />
              <path d="M21 3v9h-9" />
            </svg>
          </Button>
        </CardHeader>
      )}
      <CardContent>
        {loading && !isRefreshing ? (
          <p className="text-muted-foreground text-sm">Loading activity logs...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity found.</p>
        ) : (
          <ActivityLogClient activities={activities} showFilters={showFilters} isRefreshing={isRefreshing} />
        )}
      </CardContent>
      {showViewAll && activities.length > 0 && (
        <CardFooter className="pt-0">
          <Button asChild variant="outline" size="sm" className="gap-1 ml-auto">
            <Link href={viewAllUrl}>
              View all activity <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
