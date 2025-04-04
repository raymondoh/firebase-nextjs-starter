/**
 * Dashboard Types Index
 *
 * This file explicitly exports all dashboard-related types.
 * Using this index file makes imports clearer and helps with IDE auto-imports.
 */

// Account and user profile related types
export type { AccountSummaryProps, AccountSummaryClientProps, AccountSettingsProps, UserProfileProps } from "./account";

// Activity log related types
export type {
  ActivityLogProps,
  ActivityLogClientProps,
  //ActivityLogWrapperProps,
  //ActivityPageClientProps,
  AdminActivityLogWrapperProps,
  Activity,
  SystemStats,
  SystemAlert
} from "./activity";

// Dashboard metrics and statistics types
export type { DashboardStatsProps, DashboardMetricProps, MetricCardProps } from "./metrics";
