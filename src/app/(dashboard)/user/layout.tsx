//src/app/(dashboard)/user/Layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// This layout uses auth() or headers(), so force dynamic rendering
export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Check if they have the user role
  if (!session || session.user.role !== "user") {
    redirect("/not-authorized");
  }

  return <div className="user-container">{children}</div>;
}
