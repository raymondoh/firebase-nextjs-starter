// src/app/dashboard/admin/products/page.tsx
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ProductsDataTable } from "@/components/dashboard/admin/ProductsDataTable";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllProductsFromFirestore } from "@/firebase/actions";

export const metadata: Metadata = {
  title: "Product Management",
  description: "Manage products in your catalog"
};

export default async function AdminProductsPage() {
  // Get the session server-side
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has admin role
  if (session.user.role !== "admin") {
    redirect("/not-authorized");
  }

  // Fetch initial products data
  const result = await getAllProductsFromFirestore();
  const products = result.success ? result.data : [];

  return (
    <DashboardShell>
      <DashboardHeader heading="Product Management" text="View and manage products in your catalog." />
      <Separator className="mb-8" />

      {/* Added a container with overflow handling */}
      <div className="w-full overflow-hidden">
        <ProductsDataTable initialData={products} />
      </div>
    </DashboardShell>
  );
}
