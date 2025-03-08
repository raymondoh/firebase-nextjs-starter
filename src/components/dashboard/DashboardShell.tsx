import type React from "react";
interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return <div className="flex-1 space-y-8 p-6 max-w-8xl mx-auto w-full">{children}</div>;
}
