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
    console.log(`Admin layout - Checking if user role "${session.user?.role}" equals "admin"`);
    if (session.user?.role !== "admin") {
      console.error(`Admin layout - User role is "${session.user?.role}" - not authorized for admin access`);
      redirect("/not-authorized");
    }

    console.log("Admin layout - Access granted - rendering admin layout");

    return (
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Admin Dashboard</h1>
        </header>
        <div className="max-w-6xl mx-auto px-6 py-4 w-full">{children}</div>
      </SidebarInset>
    );
  } catch (error) {
    console.error("Error in AdminLayout:", error);
    redirect("/error");
  }
}
