import type React from "react";
import { cn } from "@/lib/utils";
interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("flex flex-col w-full space-y-4 pb-8 px-1 sm:px-0", className)} {...props}>
      {children}
    </div>
  );
}
