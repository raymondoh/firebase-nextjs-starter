import { ProductCarousel } from "@/components/carousel/product-carousel";

export default function ProductsPage() {
  return (
    <div className="space-y-16 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Product Carousel Examples</h1>
        <p className="text-muted-foreground mb-8">
          A showcase of the reusable product carousel component with different configurations.
        </p>

        {/* Default Configuration */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold">Default Configuration</h2>
          <p className="text-muted-foreground">Basic product carousel with default settings.</p>

          <ProductCarousel />
        </div>

        {/* Custom Items Per View */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold">Custom Items Per View</h2>
          <p className="text-muted-foreground">Controlling how many products appear at different breakpoints.</p>

          <ProductCarousel title="Featured Collection" itemsPerView={{ sm: 1, md: 2, lg: 2, xl: 3 }} />
        </div>

        {/* With Quick View */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold">With Quick View</h2>
          <p className="text-muted-foreground">Product carousel with quick view overlay on hover.</p>

          <ProductCarousel title="New Arrivals" showQuickView={true} />
        </div>

        {/* Custom Button Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Custom Button Text</h2>
          <p className="text-muted-foreground">Product carousel with custom call-to-action text.</p>

          <ProductCarousel title="Best Sellers" addToCartText="Buy Now" />
        </div>
      </div>
    </div>
  );
}
