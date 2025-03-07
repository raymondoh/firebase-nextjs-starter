// import { DashboardHeader } from "@/components";
// import { DashboardShell } from "@/components";

// export default function UserDashboardPage() {
//   return (
//     <DashboardShell>
//       <DashboardHeader heading="Dashboard" text="Welcome to your personal dashboard." />

//       <div className="grid gap-6">
//         <div className="rounded-lg border p-6">
//           <h2 className="text-2xl font-bold mb-4">User Dashboard Overview</h2>
//           <p>
//             Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolor libero sed, exercitationem dicta nemo
//             suscipit earum neque provident a adipisci nam tempora! Reprehenderit, placeat provident officiis quam sed
//             qui at sunt est officia optio exercitationem animi autem tenetur vero! Labore vel ratione eaque eligendi
//             illum corrupti
//           </p>
//         </div>
//       </div>
//     </DashboardShell>
//   );
// }
import { CardGridDashboard } from "@/components/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <CardGridDashboard
      title="Dashboard"
      description="Welcome to your dashboard overview."
      headerAction={
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create New
        </Button>
      }
      columns={3}>
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1,234</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$12,345</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">42</p>
        </CardContent>
      </Card>
    </CardGridDashboard>
  );
}
