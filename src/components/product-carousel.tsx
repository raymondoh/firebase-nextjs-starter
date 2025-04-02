"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export interface ProductCarouselProps {
  /**
   * Array of products to display
   */
  products?: Product[];
  /**
   * Title for the carousel section
   */
  title?: string;
  /**
   * Whether to show the title
   * @default true
   */
  showTitle?: boolean;
  /**
   * Number of items to show per view on different breakpoints
   */
  itemsPerView?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Whether to loop the carousel
   * @default true
   */
  loop?: boolean;
  /**
   * Whether to show navigation arrows
   * @default true
   */
  showArrows?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Callback when a product is clicked
   */
  onProductClick?: (product: Product) => void;
  /**
   * Callback when add to cart button is clicked
   */
  onAddToCart?: (product: Product) => void;
  /**
   * Custom button text for the add to cart button
   * @default "Add to Cart"
   */
  addToCartText?: string;
  /**
   * Whether to show the quick view button
   * @default false
   */
  showQuickView?: boolean;
}

export function ProductCarousel({
  products = [],
  title = "Featured Products",
  showTitle = true,
  itemsPerView = { sm: 1, md: 2, lg: 3, xl: 4 },
  loop = true,
  showArrows = true,
  className,
  onProductClick,
  onAddToCart,
  addToCartText = "Add to Cart",
  showQuickView = false
}: ProductCarouselProps) {
  // Calculate the basis classes based on itemsPerView
  const getBasisClasses = () => {
    const classes = [];

    if (itemsPerView.sm) {
      classes.push(`basis-1/${itemsPerView.sm}`);
    }

    if (itemsPerView.md) {
      classes.push(`md:basis-1/${itemsPerView.md}`);
    }

    if (itemsPerView.lg) {
      classes.push(`lg:basis-1/${itemsPerView.lg}`);
    }

    if (itemsPerView.xl) {
      classes.push(`xl:basis-1/${itemsPerView.xl}`);
    }

    return classes.join(" ");
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price);
  };

  return (
    <div className={cn("py-4", className)}>
      <div className="px-4">
        {showTitle && title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

        <Carousel
          opts={{
            align: "start",
            loop
          }}
          className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.length === 0 ? (
              <CarouselItem className="pl-2 md:pl-4 basis-full">
                <Card className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No products available</p>
                </Card>
              </CarouselItem>
            ) : (
              products.map(product => (
                <CarouselItem key={product.id} className={cn("pl-2 md:pl-4", getBasisClasses())}>
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <Card
                      className="h-full overflow-hidden cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleProductClick(product)}>
                      <div className="relative">
                        <div className="relative h-[200px] bg-muted">
                          <Image
                            src={product.image || "/placeholder.svg?height=200&width=200"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>

                        {/* Product badge if available */}
                        {product.badge && (
                          <Badge className="absolute top-2 right-2" variant="secondary">
                            {product.badge}
                          </Badge>
                        )}

                        {/* Quick view button */}
                        {showQuickView && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="gap-1"
                              onClick={e => {
                                e.stopPropagation();
                                handleProductClick(product);
                              }}>
                              <Eye className="h-4 w-4" />
                              Quick View
                            </Button>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
                        <p className="text-xl font-bold mt-2">
                          {typeof product.price === "number" ? formatPrice(product.price) : product.price}
                        </p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                        )}
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full"
                          variant={product.inStock === false ? "outline" : "default"}
                          disabled={product.inStock === false}
                          onClick={e => handleAddToCart(e, product)}>
                          {product.inStock === false ? (
                            "Out of Stock"
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {addToCartText}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </CarouselItem>
              ))
            )}
          </CarouselContent>

          {showArrows && products.length > 0 && (
            <>
              <CarouselPrevious className="-left-3 md:-left-5" />
              <CarouselNext className="-right-3 md:-right-5" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}
