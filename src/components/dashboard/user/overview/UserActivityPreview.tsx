"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/date";
import Link from "next/link";
import type { SerializedActivity } from "@/types/firebase/activity";

interface UserActivityPreviewProps {
  activities: SerializedActivity[];
  limit?: number;
  loading?: boolean;
  showHeader?: boolean;
  showViewAll?: boolean;
  viewAllUrl?: string;
  showFilters?: boolean;
}

export function UserActivityPreview({
  activities,
  limit = 5,
  loading = false,
  showHeader = true,
  showViewAll = true,
  viewAllUrl = "/user/activity"
}: UserActivityPreviewProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Recent activity on your account</CardDescription>
        </CardHeader>
      )}

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-[220px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">No activity found</p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, limit).map(activity => (
              <div key={activity.id} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{activity.description}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp, { relative: true })}
                  </span>
                </div>
                {activity.metadata?.details && (
                  <p className="text-xs text-muted-foreground">{activity.metadata.details}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {showViewAll && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={viewAllUrl}>View Full Activity</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
