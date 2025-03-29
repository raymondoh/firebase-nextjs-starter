// types/auth/metrics.ts
import type React from "react";
import type { ReactNode } from "react";

/**
 * Props for dashboard statistics components
 */
export interface DashboardStatsProps {
  userId: string;
  className?: string;
}

/**
 * Props for individual dashboard metric components
 */
export interface DashboardMetricProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  loading?: boolean;
  className?: string;
}

/**
 * Props for metric card components
 */
export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}
