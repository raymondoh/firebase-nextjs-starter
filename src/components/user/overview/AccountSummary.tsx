"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AccountSummaryProps } from "@/types/dashboard";
import type { Timestamp } from "firebase-admin/firestore";

export function AccountSummary({ user, profileUrl = "/user/profile", className }: AccountSummaryProps) {
  // Format creation date using manual formatting
  const formatCreationDate = () => {
    if (!user.createdAt) return "N/A";

    try {
      // Handle different types of date values
      let date: Date;
      if (user.createdAt instanceof Date) {
        date = user.createdAt;
      } else if (typeof user.createdAt === "object" && "toDate" in user.createdAt) {
        // Handle Firestore Timestamp
        date = (user.createdAt as unknown as Timestamp).toDate();
      } else {
        // Handle string or number
        date = new Date(user.createdAt as string | number);
      }

      // Manual formatting to avoid Intl.DateTimeFormat issues
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      const month = months[date.getMonth()];
      const year = date.getFullYear();

      return `${month} ${year}`;
    } catch (error) {
      console.error("Error formatting creation date:", error);
      return "N/A";
    }
  };

  // Format last login using manual relative time calculation
  const formatLastLogin = () => {
    if (!user.lastLoginAt) return "N/A";

    try {
      // Handle different types of date values
      let date: Date;
      if (user.lastLoginAt instanceof Date) {
        date = user.lastLoginAt;
      } else if (typeof user.lastLoginAt === "object" && "toDate" in user.lastLoginAt) {
        // Handle Firestore Timestamp
        date = (user.lastLoginAt as unknown as Timestamp).toDate();
      } else {
        // Handle string or number
        date = new Date(user.lastLoginAt as string | number);
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
      if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

      // Fall back to formatted date for older dates
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    } catch (error) {
      console.error("Error formatting last login date:", error);
      return "N/A";
    }
  };

  // Determine security status
  const getSecurityStatus = () => {
    // If we have explicit 2FA information, prioritize that
    if (user.has2FA) {
      return {
        status: "Secure",
        color: "text-green-600",
        icon: ShieldCheck,
        tooltip: "Your account is secured with two-factor authentication."
      };
    }

    // If email is verified and has password, consider it moderately secure
    if (user.emailVerified && user.hasPassword) {
      return {
        status: "Good",
        color: "text-yellow-600",
        icon: Shield,
        tooltip: "Your account has basic security. Consider enabling two-factor authentication."
      };
    }

    // Otherwise, consider it at risk
    return {
      status: "At Risk",
      color: "text-red-600",
      icon: ShieldAlert,
      tooltip: "Your account security could be improved. Please verify your email and set a strong password."
    };
  };

  const securityInfo = getSecurityStatus();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Account Summaryaa</CardTitle>
        <CardDescription>Your account status and information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Account Type</p>
              <p className="capitalize">{user.role || "Free Plan"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p>{formatCreationDate()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last Login</p>
              <p>{formatLastLogin()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Security Status</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={`flex items-center gap-1 ${securityInfo.color}`}>
                      <securityInfo.icon className="h-4 w-4" />
                      {securityInfo.status}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{securityInfo.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="pt-4">
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href={profileUrl}>
                Manage Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
