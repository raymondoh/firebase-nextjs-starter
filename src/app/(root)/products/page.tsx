import { getAllProductsFromFirestore } from "@/firebase/admin/products";
import { ProductCarousel } from "@/components/product-carousel";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Our Products",
  description: "Browse our collection of high-quality products with free shipping on all orders.",
  keywords: ["products", "shop", "collection", "featured items"]
};

export const dynamic = "force-dynamic"; // 👈 add this

export default async function ProductPage() {
  const result = await getAllProductsFromFirestore();

  if (!result.success) {
    return <div className="container mx-auto max-w-md mt-10">no stuff</div>;
  }
  return (
    <div>
      <div className="container mx-auto max-w-6xl mt-10">
        <ProductCarousel products={result.data} showTitle={false} />
      </div>
    </div>
  );
}
