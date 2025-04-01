"use client";

import type { Product } from "@/types/product";
import { ProductCarousel } from "@/components/product-carousel";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  return <ProductCarousel products={products} title="Featured Products" showTitle loop className="mb-10" />;
}
