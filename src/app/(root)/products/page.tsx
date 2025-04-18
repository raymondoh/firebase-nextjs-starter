import { getAllProducts, getFeaturedProducts, getHeroSlidesFromFirestore } from "@/firebase/actions";
import { ProductCarousel } from "@/components/product-carousel";
import { HeroCarousel } from "@/components/hero-carousel";
import { FeaturedProductsCarousel } from "@/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Products",
  description: "Browse our collection of high-quality products with free shipping on all orders.",
  keywords: ["products", "shop", "collection", "featured items"]
};

export const dynamic = "force-dynamic";

// 👇 Wrap the page logic in a default export function
export default async function ProductsPage() {
  const [allProductsRes, featuredRes, heroRes] = await Promise.all([
    getAllProducts(),
    getFeaturedProducts(),
    getHeroSlidesFromFirestore()
  ]);

  if (!allProductsRes.success || !featuredRes.success || !heroRes.success) {
    return <div className="container mx-auto max-w-md mt-10">No products available</div>;
  }

  return (
    <div>
      {/* Hero Carousel */}
      <div className="max-w-full md:max-w-6xl mx-auto mt-0">
        <HeroCarousel slides={heroRes.data} autoPlay loop className="mb-8" />
      </div>

      {/* All Products */}
      <div className="container max-w-7xl mx-auto mt-10">
        <ProductCarousel
          products={allProductsRes.data}
          showTitle={false}
          //itemsPerView={{ sm: 1, md: 2, lg: 1, xl: 6 }}
        />
      </div>

      {/* Featured Products */}
      <div className="container mx-auto max-w-6xl mt-10">
        <FeaturedProductsCarousel products={featuredRes.data} title="Featured Products" />
      </div>
    </div>
  );
}
