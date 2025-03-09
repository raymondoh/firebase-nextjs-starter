"use client";

import { useState } from "react";
import { Shield, LogIn, KeyRound, Mail, AlertTriangle, Search, Smartphone, Laptop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Activity types with their corresponding icons
const activityIcons = {
  login: LogIn,
  password_change: KeyRound,
  email_change: Mail,
  security_alert: AlertTriangle,
  device_authorized: Smartphone
};

// Sample activity data
const activityData = [
  {
    id: "act-1",
    type: "login",
    description: "Successful login",
    ipAddress: "192.168.1.1",
    location: "New York, USA",
    device: "Chrome on Windows",
    deviceType: "laptop",
    timestamp: "2023-08-15T14:30:00Z",
    status: "success"
  },
  {
    id: "act-2",
    type: "password_change",
    description: "Password changed",
    ipAddress: "192.168.1.1",
    location: "New York, USA",
    device: "Chrome on Windows",
    deviceType: "laptop",
    timestamp: "2023-08-14T10:15:00Z",
    status: "success"
  },
  {
    id: "act-3",
    type: "login",
    description: "Failed login attempt",
    ipAddress: "203.0.113.42",
    location: "Unknown location",
    device: "Unknown device",
    deviceType: "unknown",
    timestamp: "2023-08-13T22:45:00Z",
    status: "failed"
  },
  {
    id: "act-4",
    type: "security_alert",
    description: "Login from new location",
    ipAddress: "198.51.100.73",
    location: "London, UK",
    device: "Safari on macOS",
    deviceType: "laptop",
    timestamp: "2023-08-12T08:20:00Z",
    status: "warning"
  },
  {
    id: "act-5",
    type: "device_authorized",
    description: "New device authorized",
    ipAddress: "198.51.100.73",
    location: "London, UK",
    device: "Safari on macOS",
    deviceType: "laptop",
    timestamp: "2023-08-12T08:15:00Z",
    status: "success"
  },
  {
    id: "act-6",
    type: "login",
    description: "Successful login",
    ipAddress: "203.0.113.105",
    location: "San Francisco, USA",
    device: "Firefox on macOS",
    deviceType: "laptop",
    timestamp: "2023-08-10T16:30:00Z",
    status: "success"
  },
  {
    id: "act-7",
    type: "email_change",
    description: "Email address updated",
    ipAddress: "203.0.113.105",
    location: "San Francisco, USA",
    device: "Firefox on macOS",
    deviceType: "laptop",
    timestamp: "2023-08-10T16:45:00Z",
    status: "success"
  }
];

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

// Helper function to get the device icon
function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "laptop":
      return <Laptop className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
}

// Helper function to get the status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "success":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          Success
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
          Failed
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
          Warning
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

interface ActivityLogProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function ActivityLog({ limit = 0, showFilters = true, showHeader = true, className = "" }: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");

  // Filter activities based on search query and activity type
  const filteredActivities = activityData
    .filter(
      activity =>
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.device.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(activity => activityFilter === "all" || activity.type === activityFilter)
    // Apply limit if specified
    .slice(0, limit > 0 ? limit : undefined);

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Recent activity on your account. We'll alert you if we notice unusual activity.
          </CardDescription>
        </CardHeader>
      )}

      {showFilters && (
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search activities..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activities</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="password_change">Password changes</SelectItem>
                <SelectItem value="email_change">Email changes</SelectItem>
                <SelectItem value="security_alert">Security alerts</SelectItem>
                <SelectItem value="device_authorized">Device authorizations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}

      <CardContent className={showFilters ? "pt-0" : ""}>
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No activities found</div>
          ) : (
            filteredActivities.map(activity => {
              const ActivityIcon = activityIcons[activity.type as keyof typeof activityIcons] || Shield;

              return (
                <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.description}</p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(activity.deviceType)}
                        <span>{activity.device}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span>
                          {activity.location} ({activity.ipAddress})
                        </span>
                      </div>
                      <time dateTime={activity.timestamp}>{formatDate(activity.timestamp)}</time>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {filteredActivities.length > 0 && limit > 0 && activityData.length > limit && (
        <CardFooter>
          <Button variant="outline" className="w-full">
            View all activity
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
