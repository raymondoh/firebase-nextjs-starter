import type React from "react";
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";

interface SplitDashboardProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: "narrow" | "medium" | "wide";
}

export function SplitDashboard({
  title,
  description,
  headerAction,
  sidebar,
  children,
  sidebarWidth = "medium"
}: SplitDashboardProps) {
  const sidebarWidthClass = {
    narrow: "w-full md:w-1/4",
    medium: "w-full md:w-1/3",
    wide: "w-full md:w-2/5"
  }[sidebarWidth];

  const contentWidthClass = {
    narrow: "w-full md:w-3/4",
    medium: "w-full md:w-2/3",
    wide: "w-full md:w-3/5"
  }[sidebarWidth];

  return (
    <DashboardShell>
      <DashboardHeader heading={title} text={description}>
        {headerAction}
      </DashboardHeader>
      <Separator className="my-6" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className={`${sidebarWidthClass} space-y-6`}>{sidebar}</div>
        <div className={`${contentWidthClass} space-y-6`}>{children}</div>
      </div>
    </DashboardShell>
  );
}
