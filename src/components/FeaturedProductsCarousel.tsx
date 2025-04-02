"use client";

import { ProductCarousel } from "@/components/product-carousel";
import type { SerializedProduct } from "@/types/product";

interface FeaturedProductsCarouselProps {
  products: SerializedProduct[];
  title?: string;
}

export function FeaturedProductsCarousel({ products, title = "Featured Products" }: FeaturedProductsCarouselProps) {
  return <ProductCarousel products={products} title={title} showTitle />;
}
