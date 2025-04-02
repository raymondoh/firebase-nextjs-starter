import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    const session = await auth();

    // Add detailed logging to help debug the issue
    console.log("Admin layout - Session data:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });

    // Check if session exists
    if (!session) {
      console.error("No session found in admin layout - redirecting to login");
      redirect("/login");
    }

    // Admin-specific authorization with improved logging
    if (session.user?.role !== "admin") {
      console.error(`User with role ${session.user?.role} tried to access admin`);
      redirect("/not-authorized"); // This handles unauthorized but known users
    }

    console.log("Admin layout - Access granted - rendering admin layout");

    return (
      <SidebarInset className="w-full max-w-8xl">
        <header className="flex h-16 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10 w-full">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Admin Dashboard</h1>
        </header>
        {/* Added w-full and adjusted padding for mobile */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 overflow-x-hidden">{children}</div>
      </SidebarInset>
    );
  } catch (error) {
    console.error("Error in AdminLayout:", error);
    redirect("/not-authorized");
  }
}
