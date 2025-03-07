import { DashboardShell } from "@/components";
import { DashboardHeader } from "@/components";

export default function AdminTestPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Test Page" text="This is a simple test page to debug admin access." />
      <div className="rounded-lg border p-6 mt-4">
        <h2 className="text-2xl font-bold mb-4">Admin Test</h2>
        <p>If you can see this page, you have successfully accessed the admin area.</p>
      </div>
    </DashboardShell>
  );
}
