import type { ReactNode } from "react";
import { redirect } from "next/navigation";
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

    console.log("Root Dashboard Layout - Rendering with session");

    return (
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    );
  } catch (error) {
    console.error("Error in DashboardLayout:", error);
    redirect("/error");
  }
}
