// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatClientDate as formatDate } from "@/utils";
// import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
// import type { SerializedActivity } from "@/types/firebase/activity";
// import type { AdminActivityLogWrapperProps } from "@/types/dashboard";
// import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

// export function AdminRecentActivityPreview({
//   limit = 5,
//   showHeader = true,
//   showViewAll = true,
//   viewAllUrl = "/admin/activity"
// }: AdminActivityLogWrapperProps) {
//   const [activities, setActivities] = useState<SerializedActivity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function loadActivities() {
//       try {
//         const result = await fetchActivityLogs({ limit });

//         if (Array.isArray(result)) {
//           setActivities(result);
//         } else {
//           setError(result.error || "Failed to load activity logs");
//         }
//       } catch (err) {
//         const message = isFirebaseError(err) ? firebaseError(err) : "Unexpected error loading activity logs";
//         setError(message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadActivities();
//   }, [limit]);

//   return (
//     <Card>
//       {showHeader && (
//         <CardHeader>
//           <CardTitle>System Activity</CardTitle>
//           <CardDescription>Recent activities across the platform</CardDescription>
//         </CardHeader>
//       )}

//       <CardContent>
//         {loading ? (
//           <div className="space-y-4">
//             {Array.from({ length: limit }).map((_, i) => (
//               <div key={i} className="flex items-start space-x-4">
//                 <Skeleton className="h-12 w-12 rounded-full" />
//                 <div className="space-y-2">
//                   <Skeleton className="h-4 w-[250px]" />
//                   <Skeleton className="h-4 w-[200px]" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : error ? (
//           <p className="text-red-500 text-sm">{error}</p>
//         ) : activities.length === 0 ? (
//           <p className="text-muted-foreground text-sm text-center">No activities found</p>
//         ) : (
//           <div className="space-y-4">
//             {activities.map(activity => (
//               <div key={activity.id} className="flex flex-col space-y-1">
//                 <div className="flex items-center justify-between">
//                   <span className="font-medium">
//                     {activity.metadata?.name ?? activity.userEmail?.split("@")[0] ?? "User"}
//                   </span>

//                   <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
//                 </div>
//                 <p className="text-sm">{activity.description}</p>
//                 {activity.metadata?.details && (
//                   <p className="text-xs text-muted-foreground">{activity.metadata.details}</p>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>

//       {showViewAll && activities.length > 0 && (
//         <CardFooter>
//           <Button asChild variant="outline" className="w-full">
//             <Link href={viewAllUrl}>View All Activity</Link>
//           </Button>
//         </CardFooter>
//       )}
//     </Card>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatClientDate as formatDate } from "@/utils";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client";
import type { SerializedActivity } from "@/types/firebase/activity";
import type { AdminActivityLogWrapperProps } from "@/types/dashboard";
import { isFirebaseError, firebaseError } from "@/utils/firebase-error";

export function AdminRecentActivityPreview({
  limit = 5,
  showHeader = true,
  showViewAll = true,
  viewAllUrl = "/admin/activity"
}: AdminActivityLogWrapperProps) {
  const [activities, setActivities] = useState<SerializedActivity[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, { name?: string; email?: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadActivities() {
      try {
        const result = await fetchActivityLogs({ limit });

        if (Array.isArray(result)) {
          setActivities(result);
        } else {
          setError(result.error || "Failed to load activity logs");
        }
      } catch (err) {
        const message = isFirebaseError(err) ? firebaseError(err) : "Unexpected error loading activity logs";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, [limit]);

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
          <CardTitle>System Activity</CardTitle>
          <CardDescription>Recent activities across the platform</CardDescription>
        </CardHeader>
      )}

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">No activities found</p>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => {
              const user = usersMap.get(activity.userId);
              const displayName =
                user?.name ??
                activity.metadata?.name ??
                user?.email?.split("@")[0] ??
                activity.userEmail?.split("@")[0] ??
                "User";
              const displayEmail = user?.email ?? activity.userEmail ?? "Unknown";

              return (
                <div key={activity.id} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                  {activity.metadata?.details && (
                    <p className="text-xs text-muted-foreground">{activity.metadata.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {showViewAll && activities.length > 0 && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={viewAllUrl}>View All Activity</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
