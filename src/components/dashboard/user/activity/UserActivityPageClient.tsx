"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserActivityLogClient } from "./UserActivityLogClient"; // create or reuse this
import type { SerializedActivity } from "@/types/firebase/activity";

interface UserActivityPageClientProps {
  initialLogs: SerializedActivity[];
  isRefreshing?: boolean;
  showFilters?: boolean;
}

export function UserActivityPageClient({ initialLogs }: UserActivityPageClientProps) {
  const [activities] = useState<SerializedActivity[]>(initialLogs); // Static for now
  const [isRefreshing] = useState(false); // Placeholder, can be hooked up later

  return (
    <div className="space-y-6 w-full max-w-full">
      <Card className="p-4 sm:p-6 w-full overflow-hidden">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No activity found.</p>
        ) : (
          <UserActivityLogClient activities={activities} isRefreshing={isRefreshing} showFilters={true} />
        )}
      </Card>
    </div>
  );
}
