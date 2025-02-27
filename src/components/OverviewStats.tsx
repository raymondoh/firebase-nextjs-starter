import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface OverviewStatsProps {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down" | "neutral";
}

export function OverviewStats({ title, value, description, trend }: OverviewStatsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {trend === "up" && <ArrowUp className="h-4 w-4 text-green-500" />}
          {trend === "down" && <ArrowDown className="h-4 w-4 text-red-500" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
