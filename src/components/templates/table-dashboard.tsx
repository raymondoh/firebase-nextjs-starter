import type React from "react";
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface TableDashboardProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  filterSection?: React.ReactNode;
  children: React.ReactNode;
}

export function TableDashboard({ title, description, headerAction, filterSection, children }: TableDashboardProps) {
  return (
    <DashboardShell>
      <DashboardHeader heading={title} text={description}>
        {headerAction}
      </DashboardHeader>
      <Separator className="my-6" />
      {filterSection && <div className="mb-6">{filterSection}</div>}
      <Card>{children}</Card>
    </DashboardShell>
  );
}
