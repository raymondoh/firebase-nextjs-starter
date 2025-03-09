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
