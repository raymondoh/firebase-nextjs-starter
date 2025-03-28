// export default function ChangePasswordLoading() {
//   return (
//     <div className="max-w-2xl mx-auto py-8">
//       <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6"></div>
//       <div className="p-6 bg-card rounded-lg shadow-md">
//         <div className="space-y-2 mb-6">
//           <div className="h-7 w-48 bg-muted rounded animate-pulse"></div>
//           <div className="h-4 w-72 bg-muted rounded animate-pulse"></div>
//         </div>
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
//             <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
//           </div>
//           <div className="space-y-2">
//             <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
//             <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
//             <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
//           </div>
//           <div className="space-y-2">
//             <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
//             <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
//           </div>
//           <div className="h-10 w-full bg-primary/30 rounded animate-pulse mt-6"></div>
//         </div>
//       </div>
//     </div>
//   );
// }
// app/admin/loading.tsx or app/admin/dashboard/loading.tsx
import { DashboardShell, DashboardHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Loading your dashboard..." />
      <Separator className="mb-8" />

      {/* Top row skeletons */}
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Skeleton className="h-[220px] w-full" />
        <Skeleton className="h-[220px] w-full" />
      </div>

      {/* Bottom row skeletons */}
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </DashboardShell>
  );
}
