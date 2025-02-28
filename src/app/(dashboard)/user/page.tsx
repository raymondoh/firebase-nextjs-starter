// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Overview } from "@/components";
// import { RecentActivity } from "@/components";

// export default function UserDashboard() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-red-400">User Dashboard</h1>
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">25</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Notifications</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">3</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Last Login</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">2 days ago</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Account Status</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">Active</div>
//           </CardContent>
//         </Card>
//       </div>
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="col-span-4">
//           <CardHeader>
//             <CardTitle>Activity Overview</CardTitle>
//           </CardHeader>
//           <CardContent className="pl-2">
//             <Overview />
//           </CardContent>
//         </Card>
//         <Card className="col-span-3">
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <RecentActivity />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components";

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text=" See what you can do here." />
      <div className="space-y-6">
        <Separator />
        <ProfileForm />
      </div>
    </DashboardShell>
  );
}
