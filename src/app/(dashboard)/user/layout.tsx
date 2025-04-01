import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@/auth";

export default async function UserLayout({ children }: { children: ReactNode }) {
  try {
    const session = await auth();
    const role = session?.user?.role;

    console.log("User layout - Session:", {
      exists: !!session,
      role,
      id: session?.user?.id,
      email: session?.user?.email
    });

    if (!session || !role) {
      redirect("/login");
    }

    if (role === "admin") {
      redirect("/admin");
    }

    if (role !== "user") {
      console.error(`Unknown role "${role}"`);
      redirect("/not-authorized");
    }

    return (
      <SidebarInset className="w-full max-w-8xl">
        <header className="flex h-16 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 w-full">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">User Dashboard</h1>
        </header>
        {/* Reduced padding on mobile */}
        <div className="w-full mx-auto px-4 sm:px-6 py-4 overflow-x-hidden">{children}</div>
      </SidebarInset>
    );
  } catch (error) {
    console.error("Error in UserLayout:", error);
    redirect("/error");
  }
}
