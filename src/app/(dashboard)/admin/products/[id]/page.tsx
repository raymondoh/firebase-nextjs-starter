// src/(dashboard)/admin/products/[id]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DashboardShell, DashboardHeader } from "@/components";
import { UpdateProductForm } from "@/components/dashboard/admin/products/UpdateProductForm";
import { auth } from "@/auth";
import { getProductById } from "@/actions/products";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit product details"
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/not-authorized");
  }

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/not-authorized");
  }

  const result = await getProductById(productId);

  if (!result.success || !result.product) {
    notFound();
  }

  const product = result.product;

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Product" text={`Update details for ${product.name}`} />
      <Separator className="mb-8" />

      <div className="w-full max-w-4xl overflow-hidden">
        <div className="rounded-lg border bg-card p-6">
          <UpdateProductForm product={product} />
        </div>
      </div>
    </DashboardShell>
  );
}
