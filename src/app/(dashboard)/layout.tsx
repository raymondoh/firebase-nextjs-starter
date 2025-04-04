import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { auth } from "@/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    // Basic authentication check
    const session = await auth();

    console.log("Root Dashboard Layout - Session data:", {
      exists: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });

    if (!session) {
      console.log("Root Dashboard Layout - No session, redirecting to login");
      redirect("/login");
    }

    // Get the cookie store and read sidebar state
    // Default to false (collapsed) if the cookie doesn't exist
    const cookieStore = await cookies(); // No need for await here
    const sidebarCookie = cookieStore.get("sidebar:state");
    const sidebarState = sidebarCookie ? sidebarCookie.value === "true" : false;

    console.log("Root Dashboard Layout - Sidebar cookie:", sidebarCookie);
    console.log("Root Dashboard Layout - Sidebar state:", sidebarState);

    return (
      <SidebarProvider defaultOpen={sidebarState}>
        <AppSidebar />
        {children}
      </SidebarProvider>
    );
  } catch (error) {
    console.error("Error in DashboardLayout:", error);
    redirect("/error");
  }
}
