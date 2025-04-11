// // app/dashboard/loading.tsx
// import { DashboardShell, DashboardHeader } from "@/components";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Separator } from "@/components/ui/separator";

// export default function DashboardLoading() {
//   return (
//     <DashboardShell>
//       <DashboardHeader heading="Dashboard" text="Loading your dashboard..." />
//       <Separator className="mb-8" />

//       {/* Top row skeletons */}
//       <div className="grid gap-8 md:grid-cols-2 mb-8">
//         <Skeleton className="h-[220px] w-full" />
//         <Skeleton className="h-[220px] w-full" />
//       </div>

//       {/* Bottom row skeletons */}
//       <div className="grid gap-8 md:grid-cols-2">
//         <Skeleton className="h-[300px] w-full" />
//         <Skeleton className="h-[300px] w-full" />
//       </div>
//     </DashboardShell>
//   );
// }
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell, DashboardHeader } from "@/components";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Loading overview..." />
      <Separator className="mb-8" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[220px] w-full" />
        <Skeleton className="h-[220px] w-full" />
        <Skeleton className="h-[220px] w-full" />
        <Skeleton className="h-[220px] w-full" />
      </div>
    </DashboardShell>
  );
}
