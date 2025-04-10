// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { AdminActivityLogClient } from "@/components";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/firebase/client";
// import type { SerializedActivity } from "@/types/firebase/activity";
// //import type { AdminActivityPageClientProps } from "@/types/dashboard/activity";

// interface AdminActivityPageClientProps {
//   initialLogs: SerializedActivity[];
// }

// export function AdminActivityPageClient({ initialLogs }: AdminActivityPageClientProps) {
//   const [activities, setActivities] = useState<SerializedActivity[]>(initialLogs);
//   const [usersMap, setUsersMap] = useState<Map<string, { name?: string; email?: string }>>(new Map());
//   const [pageSize, setPageSize] = useState(10);
//   const [activeType, setActiveType] = useState<string | undefined>();

//   const loadUsers = useCallback(async () => {
//     try {
//       const snapshot = await getDocs(collection(db, "users"));
//       const map = new Map<string, { name?: string; email?: string }>();
//       snapshot.forEach(doc => {
//         const data = doc.data();
//         map.set(doc.id, {
//           name: data.name,
//           email: data.email
//         });
//       });
//       setUsersMap(map);
//     } catch (err) {
//       console.warn("Failed to fetch users for activity enrichment:", err);
//     }
//   }, []);

//   const enrichLogsWithUsers = useCallback(
//     (logs: SerializedActivity[]) => {
//       return logs.map(log => {
//         const user = usersMap.get(log.userId);
//         return {
//           ...log,
//           metadata: {
//             ...log.metadata,
//             name:
//               user?.name ?? log.metadata?.name ?? user?.email?.split("@")[0] ?? log.userEmail?.split("@")[0] ?? "User"
//           },
//           userEmail: user?.email ?? log.userEmail ?? "Unknown"
//         };
//       });
//     },
//     [usersMap]
//   );

//   // Enrich logs on first render
//   useEffect(() => {
//     if (initialLogs.length) {
//       const enriched = enrichLogsWithUsers(initialLogs);
//       setActivities(enriched);
//     }
//   }, [initialLogs, enrichLogsWithUsers]);

//   useEffect(() => {
//     loadUsers();
//   }, [loadUsers]);

//   const handleTypeChange = (value: string) => {
//     setActiveType(value === "all" ? undefined : value);
//   };

//   const handlePageSizeChange = (value: string) => {
//     setPageSize(Number(value));
//   };

//   const activityTypes = [
//     { label: "All Activities", value: "all" },
//     { label: "Logins", value: "login" },
//     { label: "Logouts", value: "logout" },
//     { label: "Registrations", value: "registration" },
//     { label: "Password Resets", value: "password_reset" },
//     { label: "Profile Updates", value: "profile_update" },
//     { label: "Email Verifications", value: "email_verification" },
//     { label: "Settings Changes", value: "settings_change" },
//     { label: "Deletions", value: "deletion_completed" }
//   ];

//   return (
//     <Card className="w-full space-y-4 p-4">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div className="flex items-center gap-2">
//           <Select value={activeType ?? "all"} onValueChange={handleTypeChange}>
//             <SelectTrigger className="w-[200px]">
//               <SelectValue placeholder="Filter by type" />
//             </SelectTrigger>
//             <SelectContent>
//               {activityTypes.map(type => (
//                 <SelectItem key={type.value} value={type.value}>
//                   {type.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
//             <SelectTrigger className="w-[120px]">
//               <SelectValue placeholder="Page size" />
//             </SelectTrigger>
//             <SelectContent>
//               {[5, 10, 25, 50].map(size => (
//                 <SelectItem key={size} value={String(size)}>
//                   {size} per page
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <AdminActivityLogClient activities={activities} showFilters={true} />
//     </Card>
//   );
// }
// src/components/dashboard/user/activity/ActivityPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityLogClient } from "./AdminActivityLogClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SerializedActivity } from "@/types/firebase/activity";
import { getDisplayName } from "@/utils/getDisplayName";

interface ActivityPageClientProps {
  initialLogs: SerializedActivity[];
}

export function ActivityPageClient({ initialLogs }: ActivityPageClientProps) {
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
            <ActivityLogClient activities={activities} showFilters={false} isRefreshing={isRefreshing} />
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
