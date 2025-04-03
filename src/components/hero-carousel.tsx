"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type HeroSlide, heroSlides as defaultSlides } from "@/lib/carousel-data";

export interface HeroCarouselProps {
  /**
   * Array of slides to display in the carousel
   */
  slides?: HeroSlide[];
  /**
   * Whether to enable auto-play
   * @default true
   */
  autoPlay?: boolean;
  /**
   * Interval between auto-play transitions (in ms)
   * @default 5000
   */
  autoPlayInterval?: number;
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
   * Whether to show navigation indicators
   * @default true
   */
  showIndicators?: boolean;
  /**
   * Custom class name for the carousel container
   */
  className?: string;
  /**
   * Custom height for the carousel
   * @default "h-[500px]"
   */
  height?: string;
}

export function HeroCarousel({
  slides = defaultSlides,
  autoPlay = true,
  autoPlayInterval = 5000,
  //loop = true,
  showArrows = true,
  showIndicators = true,
  className,
  height = "h-[500px]"
}: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Set up the carousel API
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play functionality
  useEffect(() => {
    if (!api || !autoPlay) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [api, autoPlay, autoPlayInterval]);

  // Options for the carousel
  const carouselOptions = { loop: true };

  return (
    <div className={cn("relative", className)}>
      <Carousel setApi={setApi} className="w-full" opts={carouselOptions}>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div
                className={cn(
                  height,
                  "w-full flex items-center justify-center px-6 relative overflow-hidden md:mt-10 md:rounded-md"
                )}>
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={slide.backgroundImage || "/placeholder.svg"}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Slide Content */}
                <div className="relative z-10 max-w-3xl text-center text-white">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-lg md:text-xl mb-8 opacity-90">{slide.description}</p>
                  {slide.cta && (
                    <Button size="lg" variant="secondary" className="group" asChild={!!slide.ctaHref}>
                      {slide.ctaHref ? (
                        <Link href={slide.ctaHref}>
                          {slide.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      ) : (
                        <>
                          {slide.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {showArrows && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>

      {/* Custom indicators */}
      {showIndicators && count > 0 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                current === index ? "bg-white scale-100" : "bg-white/50 scale-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
