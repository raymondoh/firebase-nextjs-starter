"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/date";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client/firebase-client-init";
import type { AdminActivityLogWrapperProps } from "@/types/dashboard";
import { getDisplayName } from "@/utils/getDisplayName";
import { UserAvatar } from "@/components/shared/UserAvatar";

export function AdminActivityPreview({
  activities,
  limit = 5,
  showHeader = true,
  showViewAll = true,
  viewAllUrl = "/admin/activity"
}: AdminActivityLogWrapperProps) {
  const [usersMap, setUsersMap] = useState<Map<string, { name?: string; email?: string }>>(new Map());

  const enrichedActivities = activities.slice(0, limit).map(activity => {
    const user = usersMap.get(activity.userId);
    return {
      ...activity,
      displayName: getDisplayName(user?.name, user?.email, activity.userEmail)
    };
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const map = new Map<string, { name?: string; email?: string }>();

        snapshot.forEach(doc => {
          const data = doc.data();
          map.set(doc.id, {
            name: data.name,
            email: data.email
          });
        });

        setUsersMap(map);
      } catch (err) {
        console.warn("Failed to fetch user map:", err);
      }
    }

    loadUsers();
  }, []);

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest admin and user activity</CardDescription>
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          enrichedActivities.map(activity => (
            <div key={activity.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    src={activity.image}
                    name={activity.name}
                    email={activity.userEmail}
                    className="h-8 w-8"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{activity.name}</span>
                    {activity.userEmail && <span className="text-xs text-muted-foreground">{activity.userEmail}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(activity.timestamp, { relative: true })}
                </span>
              </div>
              <p className="text-xs">{activity.description}</p>
            </div>
          ))
        )}
      </CardContent>

      {showViewAll && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={viewAllUrl}>View All Activity</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
