"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/client";
import Link from "next/link";

interface Activity {
  id: string;
  userId: string;
  action: string;
  timestamp: any;
  details?: string;
  userEmail?: string;
}

interface AdminActivityLogWrapperProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllUrl?: string;
}

export function AdminActivityLogWrapper({
  limit: activityLimit = 5,
  showFilters = false,
  showHeader = true,
  showViewAll = true,
  viewAllUrl = "/admin/activity"
}: AdminActivityLogWrapperProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const activitiesQuery = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(activityLimit));

        const snapshot = await getDocs(activitiesQuery);
        const activitiesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            action: data.action,
            timestamp: data.timestamp?.toDate?.() || data.timestamp,
            details: data.details,
            userEmail: data.userEmail
          };
        });

        setActivities(activitiesData);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [activityLimit]);

  function formatTimestamp(timestamp: Date) {
    if (!timestamp) return "Unknown time";

    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    // Format as date
    return timestamp.toLocaleDateString();
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>Recent activities across the platform</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: activityLimit }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No activities found</p>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{activity.userEmail ? activity.userEmail.split("@")[0] : "User"}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                </div>
                <p className="text-sm">{activity.action}</p>
                {activity.details && <p className="text-xs text-muted-foreground">{activity.details}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {showViewAll && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={viewAllUrl}>View All Activity!!</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
