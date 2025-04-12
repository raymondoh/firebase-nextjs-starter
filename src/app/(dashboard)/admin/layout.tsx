// src/app/(dashboard)/admin/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// This layout uses auth() or headers(), so force dynamic rendering
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // We don't need to check if user is logged in because the parent layout already does that
  // We only need to check if they're an admin
  if (!session || session.user.role !== "admin") {
    redirect("/not-authorized");
  }

  return <div className="admin-container">{children}</div>;
}
