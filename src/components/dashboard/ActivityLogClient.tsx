"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import type { ActivityLogClientProps } from "@/types/dashboard/activity";

export function ActivityLogClient({ activities, showFilters = true, isRefreshing = false }: ActivityLogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  // Filter activities based on search term and type filter
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm
      ? activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesType = filterType ? activity.type === filterType : true;

    return matchesSearch && matchesType;
  });

  // Get unique activity types for the filter dropdown
  const activityTypes = Array.from(new Set(activities.map(activity => activity.type)));

  // Function to get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failure":
      case "failed":
        return "destructive";
      case "warning":
        return "warning";
      case "pending":
        return "outline";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  // Function to format timestamp using native JS
  const formatTimestamp = (timestamp: string | any) => {
    try {
      let date: Date;

      // If it's already a string, try to parse it
      if (typeof timestamp === "string") {
        date = new Date(timestamp);
      }
      // If it has a toDate method (Firestore Timestamp), use it
      else if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
        date = timestamp.toDate();
      } else {
        return "Unknown time";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      // Calculate relative time
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Format relative time
      if (diffSecs < 60) return diffSecs === 1 ? "1 second ago" : `${diffSecs} seconds ago`;
      if (diffMins < 60) return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
      if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      if (diffDays < 30) return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      if (diffMonths < 12) return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
      return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType || ""} onValueChange={value => setFilterType(value === "all" ? null : value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {activityTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="sm:w-[100px]" onClick={() => setSearchTerm("")}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Reset
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No activities found.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.description}</TableCell>
                  <TableCell>{activity.type.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(activity.status)}>{activity.status}</Badge>
                  </TableCell>
                  <TableCell>{formatTimestamp(activity.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
