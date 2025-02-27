import { DashboardHeader } from "@/components";
import { DashboardShell } from "@/components";
import { OverviewStats } from "@/components";
import { RecentSales } from "@/components";
import { OverviewChart } from "@/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your business metrics" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewStats title="Total Revenue" value="$45,231.89" description="+20.1% from last month" trend="up" />
        <OverviewStats title="Subscriptions" value="2,350" description="+180.1% from last month" trend="up" />
        <OverviewStats title="Active Users" value="1,247" description="+19% from last month" trend="up" />
        <OverviewStats title="Churn Rate" value="12.5%" description="-3.4% from last month" trend="down" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly revenue and user growth</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
