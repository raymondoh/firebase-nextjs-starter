import { getAllProductsFromFirestore, getFeaturedProductsFromFirestore } from "@/firebase/admin/products";
import { ProductCarousel } from "@/components/product-carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import { heroSlides } from "@/lib/carousel-data";
import { FeaturedProductsCarousel } from "@/components";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Our Products",
  description: "Browse our collection of high-quality products with free shipping on all orders.",
  keywords: ["products", "shop", "collection", "featured items"]
};

export const dynamic = "force-dynamic"; // 👈 add this

export default async function ProductsPage() {
  const result = await getAllProductsFromFirestore();
  const featured = await getFeaturedProductsFromFirestore();

  if (!result.success) {
    return <div className="container mx-auto max-w-md mt-10">no products</div>;
  }
  return (
    <div>
      {/* 👇 HeroCarousel appears at the top */}
      <div className="container mx-auto max-w-6xl mt-10">
        <HeroCarousel slides={heroSlides} autoPlay loop className="mb-8" />
      </div>
      {/* 👇 Product Carousel appears below */}
      <div className="container mx-auto max-w-6xl mt-10">
        <ProductCarousel products={result.data} showTitle={false} />
      </div>

      {/* Featured Carousel */}
      <div className="container mx-auto max-w-6xl mt-10">
        {" "}
        {featured.success && featured.data.length > 0 && (
          <div className="container mx-auto max-w-6xl mt-10">
            <FeaturedProductsCarousel products={featured.data} />
          </div>
        )}
      </div>
    </div>
  );
}
