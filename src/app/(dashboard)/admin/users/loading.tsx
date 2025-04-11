import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell, DashboardHeader } from "@/components";
import { Separator } from "@/components/ui/separator";

export default function AdminUsersLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Manage Users" text="View and manage all registered users." />
      <Separator className="mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 border p-4 rounded-md">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
