import type React from "react";
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";

interface BasicDashboardProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function BasicDashboard({ title, description, headerAction, children }: BasicDashboardProps) {
  return (
    <DashboardShell>
      <DashboardHeader heading={title} text={description}>
        {headerAction}
      </DashboardHeader>
      <Separator className="my-6" />
      <div className="space-y-6">{children}</div>
    </DashboardShell>
  );
}
