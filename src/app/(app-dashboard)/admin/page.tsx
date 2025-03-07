// import { redirect } from "next/navigation";
// import { auth } from "@/auth";
// import { DashboardShell } from "@/components";
// import { DashboardHeader } from "@/components";

// export default async function AdminDashboardPage() {
//   const session = await auth();

//   // Add detailed logging to help debug the issue
//   console.log("Admin page - Session data:", {
//     exists: !!session,
//     userId: session?.user?.id,
//     userEmail: session?.user?.email,
//     userRole: session?.user?.role
//   });

//   // Check if session exists
//   if (!session) {
//     console.error("No session found - redirecting to login");
//     redirect("/login");
//   }

//   // Check if user has admin role - use strict equality and add more logging
//   console.log(`Checking if user role "${session.user?.role}" equals "admin"`);
//   if (session.user?.role !== "admin") {
//     console.error(`User role is "${session.user?.role}" - not authorized for admin access`);
//     redirect("/not-authorized"); // Make sure this path matches your not-authorized page
//   }

//   console.log("Admin access granted - rendering admin dashboard");

//   return (
//     <DashboardShell>
//       <DashboardHeader heading="Admin Dashboard" text="Manage your application and users." />
//       <div className="rounded-lg border p-6">
//         <h2 className="text-2xl font-bold mb-4">Admin Dashboard Overview</h2>
//         <p>Welcome to the admin dashboard. Here you can manage users, view analytics, and configure system settings.</p>
//       </div>
//     </DashboardShell>
//   );
// }
import { DashboardShell } from "@/components";
import { DashboardHeader } from "@/components";

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Manage your application and users." />
      <div className="rounded-lg border p-6 mt-4">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard Overview</h2>
        <p>Welcome to the admin dashboard. Here you can manage users, view analytics, and configure system settings.</p>
      </div>
    </DashboardShell>
  );
}
