import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard built with shadcn/ui"
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await auth();

    if (!session) {
      redirect("/login");
    }

    if (session.user.role !== "admin") {
      // Redirect to a "not authorized" page instead of login
      redirect("/not-authorized");
    }

    return (
      <div className="">
        <SidebarProvider>
          <div className="container mx-auto flex min-h-screen">
            <DashboardSidebar />
            <div className="flex-1">{children}</div>
          </div>
        </SidebarProvider>
      </div>
    );
  } catch (error) {
    console.error("Error in AdminLayout:", error);
    // Redirect to an error page or show an error message
    redirect("/error");
  }
}
