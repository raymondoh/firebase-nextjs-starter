import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { CustomersTable } from "@/components";

export default function CustomersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Customers" text="Manage your customer relationships" />
      <CustomersTable />
    </DashboardShell>
  );
}
