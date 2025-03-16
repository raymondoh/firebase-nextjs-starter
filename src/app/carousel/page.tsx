import { HeroCarousel } from "@/components/carousel/hero-carousel";

export default function CarouselPage() {
  return (
    <div className="space-y-12 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Hero Carousel Examples</h1>
        <p className="text-muted-foreground mb-8">
          A showcase of the reusable hero carousel component with different configurations.
        </p>

        {/* Default Configuration */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold">Default Configuration</h2>
          <p className="text-muted-foreground">Using the carousel with default settings.</p>

          <div className="rounded-lg overflow-hidden">
            <HeroCarousel />
          </div>
        </div>

        {/* Custom Configuration */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Custom Configuration</h2>
          <p className="text-muted-foreground">Carousel with custom height and no auto-play.</p>

          <div className="rounded-lg overflow-hidden">
            <HeroCarousel height="h-[400px]" autoPlay={false} showIndicators={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
