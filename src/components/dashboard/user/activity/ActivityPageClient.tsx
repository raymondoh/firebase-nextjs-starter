// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { ActivityLogClient } from "./ActivityLogClient";
// import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import type { SerializedActivity } from "@/types/firebase/activity";

// export function ActivityPageClient() {
//   const [activities, setActivities] = useState<SerializedActivity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [pageSize, setPageSize] = useState(10);
//   const [activeType, setActiveType] = useState<string | undefined>(undefined);

//   // Load initial data
//   useEffect(() => {
//     loadActivities();
//   }, [pageSize, activeType]);

//   const loadActivities = async (reset = true) => {
//     try {
//       setIsRefreshing(true);

//       const params = {
//         limit: pageSize,
//         type: activeType
//       };

//       const data = await fetchActivityLogs(params);

//       if (Array.isArray(data)) {
//         if (reset) {
//           setActivities(data as SerializedActivity[]);
//         } else {
//           setActivities(prev => [...prev, ...(data as SerializedActivity[])]);
//         }

//         // If we got fewer items than requested, there are no more to load
//         setHasMore(data.length === pageSize);
//       } else {
//         console.error("Invalid data format received:", data);
//         setError("Invalid data format received");
//       }
//     } catch (err) {
//       console.error("Failed to fetch activity logs:", err);
//       setError("Failed to load activity logs");
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   const loadMore = async () => {
//     if (!activities.length) return;

//     try {
//       setIsRefreshing(true);

//       const lastActivity = activities[activities.length - 1];
//       const params = {
//         limit: pageSize,
//         startAfter: lastActivity.id,
//         type: activeType
//       };

//       const data = await fetchActivityLogs(params);

//       if (Array.isArray(data)) {
//         setActivities(prev => [...prev, ...(data as SerializedActivity[])]);

//         // If we got fewer items than requested, there are no more to load
//         setHasMore(data.length === pageSize);
//       } else {
//         console.error("Invalid data format received:", data);
//         setError("Invalid data format received");
//       }
//     } catch (err) {
//       console.error("Failed to fetch more activity logs:", err);
//       setError("Failed to load more activity logs");
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const handleRefresh = () => {
//     loadActivities(true);
//   };

//   const handleTypeChange = (value: string) => {
//     setActiveType(value === "all" ? undefined : value);
//   };

//   const handlePageSizeChange = (value: string) => {
//     setPageSize(Number.parseInt(value, 10));
//   };

//   // Activity type options
//   const activityTypes = [
//     { label: "All Activities", value: "all" },
//     { label: "Logins", value: "login" },
//     { label: "Logouts", value: "logout" },
//     { label: "Registrations", value: "registration" },
//     { label: "Password Resets", value: "password_reset" },
//     { label: "Profile Updates", value: "profile_update" },
//     { label: "Email Verifications", value: "email_verification" },
//     { label: "Settings Changes", value: "settings_change" }
//   ];

//   return (
//     <div className="space-y-6 w-full max-w-full">
//       <div className="flex flex-col sm:flex-row justify-between gap-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="w-full sm:w-48">
//             <Select value={activeType || "all"} onValueChange={handleTypeChange}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Filter by type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {activityTypes.map(type => (
//                   <SelectItem key={type.value} value={type.value}>
//                     {type.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="w-full sm:w-32">
//             <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Page size" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="5">5 per page</SelectItem>
//                 <SelectItem value="10">10 per page</SelectItem>
//                 <SelectItem value="25">25 per page</SelectItem>
//                 <SelectItem value="50">50 per page</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-10">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}>
//             <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9" />
//             <path d="M21 3v9h-9" />
//           </svg>
//           Refresh
//         </Button>
//       </div>

//       <Card className="p-4 sm:p-6 w-full overflow-hidden">
//         {loading && !isRefreshing ? (
//           <p className="text-muted-foreground text-sm">Loading activity logs...</p>
//         ) : error ? (
//           <p className="text-red-500 text-sm">{error}</p>
//         ) : activities.length === 0 ? (
//           <p className="text-muted-foreground text-sm">No activity found.</p>
//         ) : (
//           <div className="w-full overflow-hidden">
//             <ActivityLogClient activities={activities} showFilters={false} isRefreshing={isRefreshing} />

//             {hasMore && (
//               <div className="mt-6 text-center">
//                 <Button variant="outline" onClick={loadMore} disabled={isRefreshing}>
//                   {isRefreshing ? "Loading..." : "Load More"}
//                 </Button>
//               </div>
//             )}
//           </div>
//         )}
//       </Card>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityLogClient } from "./ActivityLogClient";
import { fetchActivityLogs } from "@/actions/dashboard/activity-logs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SerializedActivity } from "@/types/firebase/activity";
import { useSession } from "next-auth/react";
import { getDisplayName } from "@/utils/getDisplayName";

export function ActivityPageClient() {
  const [activities, setActivities] = useState<SerializedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [activeType, setActiveType] = useState<string | undefined>(undefined);

  const { data: session } = useSession();

  useEffect(() => {
    loadActivities();
  }, [pageSize, activeType]);

  const loadActivities = async (reset = true) => {
    try {
      setIsRefreshing(true);

      const params = {
        limit: pageSize,
        type: activeType
      };

      const data = await fetchActivityLogs(params);

      if (Array.isArray(data)) {
        const enriched = data.map(activity => ({
          ...activity,
          userEmail: session?.user?.email ?? activity.userEmail,
          metadata: {
            ...activity.metadata,
            name: getDisplayName(session?.user?.name, session?.user?.email)
          }
        }));

        if (reset) {
          setActivities(enriched);
        } else {
          setActivities(prev => [...prev, ...enriched]);
        }
        setHasMore(enriched.length === pageSize);
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

  const loadMore = async () => {
    if (!activities.length) return;

    try {
      setIsRefreshing(true);

      const lastActivity = activities[activities.length - 1];
      const params = {
        limit: pageSize,
        startAfter: lastActivity.id,
        type: activeType
      };

      const data = await fetchActivityLogs(params);

      if (Array.isArray(data)) {
        const enriched = data.map(activity => ({
          ...activity,
          userEmail: session?.user?.email ?? activity.userEmail,
          metadata: {
            ...activity.metadata,
            name: getDisplayName(session?.user?.name, session?.user?.email)
          }
        }));

        setActivities(prev => [...prev, ...enriched]);
        setHasMore(enriched.length === pageSize);
      } else {
        console.error("Invalid data format received:", data);
        setError("Invalid data format received");
      }
    } catch (err) {
      console.error("Failed to fetch more activity logs:", err);
      setError("Failed to load more activity logs");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadActivities(true);
  };

  const handleTypeChange = (value: string) => {
    setActiveType(value === "all" ? undefined : value);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number.parseInt(value, 10));
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
        {loading && !isRefreshing ? (
          <p className="text-muted-foreground text-sm">Loading activity logs...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No activity found.</p>
        ) : (
          <div className="w-full overflow-hidden">
            <ActivityLogClient activities={activities} showFilters={false} isRefreshing={isRefreshing} />
            {hasMore && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={loadMore} disabled={isRefreshing}>
                  {isRefreshing ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
