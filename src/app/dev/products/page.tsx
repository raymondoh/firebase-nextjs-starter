import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { ProductCarousel } from "../../../components/product-carousel";
import { ProductForm } from "../../../components/dashboard/admin/ProductForm";
import { getAllProductsFromFirestore } from "@/firebase/admin/products";

export default async function ProductsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const result = await getAllProductsFromFirestore();

  if (!result.success) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Products" text="Manage your product catalog" />
        <Separator className="mb-8" />
        <p className="text-red-500 text-center">{result.error}</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Products" text="Manage your product catalog and view the carousel" />
      <Separator className="mb-8" />

      <div className="space-y-10 w-full max-w-full overflow-hidden">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Product Carousel</h2>
          <div className="rounded-lg border bg-card">
            <ProductCarousel products={result.data} showTitle={false} />
          </div>
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <div className="rounded-lg border bg-card p-6">
            <ProductForm />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
