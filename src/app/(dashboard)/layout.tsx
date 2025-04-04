// src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    // Basic authentication check
    const session = await auth();

    console.log("Dashboard Layout - Session data:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });

    if (!session) {
      console.log("Dashboard Layout - No session, redirecting to login");
      redirect("/login");
    }

    const role = session.user?.role;

    // Role-based redirects
    if (role !== "admin" && role !== "user") {
      console.error(`Unknown role "${role}", redirecting to not-authorized`);
      redirect("/not-authorized");
    }

    // Get the cookie store and read sidebar state
    const cookieStore = await cookies();
    const sidebarCookie = cookieStore.get("sidebar:state");
    const sidebarState = sidebarCookie ? sidebarCookie.value === "true" : false;

    console.log("Dashboard Layout - Sidebar state:", sidebarState);

    return (
      <SidebarProvider defaultOpen={sidebarState}>
        {/* The w-full class here is crucial for proper layout */}
        <div className="flex h-screen overflow-hidden w-full">
          {/* Sidebar component */}
          <AppSidebar />

          {/* Main content area */}
          <SidebarInset className="flex-1 flex flex-col w-full">
            {/* Header with trigger button */}
            <header className="flex h-16 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
              <SidebarTrigger className="-ml-1" />
              <h1 className="font-semibold">{role === "admin" ? "Dashboard Menu" : "Dashboard Menu"}</h1>
            </header>

            {/* Main content with centered container */}
            <main className="flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  } catch (error) {
    console.error("Error in DashboardLayout:", error);
    redirect("/error");
  }
}
