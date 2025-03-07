import type React from "react";
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";

interface CardGridDashboardProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function CardGridDashboard({ title, description, headerAction, children, columns = 3 }: CardGridDashboardProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  }[columns];

  return (
    <DashboardShell>
      <DashboardHeader heading={title} text={description}>
        {headerAction}
      </DashboardHeader>
      <Separator className="my-6" />
      <div className={`grid ${gridCols} gap-6`}>{children}</div>
    </DashboardShell>
  );
}
