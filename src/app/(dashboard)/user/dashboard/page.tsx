// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export default function UserDashboard() {
//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Profile Completion</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p>Your profile is 80% complete</p>
//             {/* Add a progress bar component here */}
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul>
//               <li>Logged in 2 hours ago</li>
//               <li>Updated profile yesterday</li>
//             </ul>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Notifications</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p>You have 3 unread notifications</p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { Separator } from "@/components/ui/separator";
import { NotificationsForm } from "@/components";

export default function UserDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your notification preferences and communication settings." />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Notification Settings</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified about activity and updates.
          </p>
        </div>
        <Separator />
        <NotificationsForm />
      </div>
    </DashboardShell>
  );
}
