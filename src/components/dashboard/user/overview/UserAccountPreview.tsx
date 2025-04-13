"use client";

import { AccountSummary } from "./AccountSummary";
import { AccountSummarySkeleton } from "./AccountSummarySkeleton";
import type { SerializedUser } from "@/types/user";
import { formatDate } from "@/utils/date";

type Props = {
  serializedUserData: SerializedUser;
  isLoading?: boolean;
};

export function UserAccountPreview({ serializedUserData, isLoading = false }: Props) {
  if (isLoading || !serializedUserData) {
    return <AccountSummarySkeleton />;
  }

  const user = {
    ...serializedUserData,
    createdAt: formatDate(serializedUserData.createdAt, { relative: true }),
    updatedAt: formatDate(serializedUserData.updatedAt, { relative: true }),
    lastLoginAt: formatDate(serializedUserData.lastLoginAt, { relative: true })
  };

  return <AccountSummary user={user} profileUrl="/user/profile" />;
}
