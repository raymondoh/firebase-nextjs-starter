// src/types/crousel/hero.ts
export interface HeroSlide {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  cta?: string;
  ctaHref?: string;
  order: number;
  active: boolean;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

// Serialized type (same as HeroSlide in your case)
export type SerializedHeroSlide = HeroSlide;

// Success result
export interface GetHeroSlidesResult {
  success: true;
  slides: SerializedHeroSlide[];
}

// Error result
export interface GetHeroSlidesError {
  success: false;
  error: string;
}

// Union type response
export type GetHeroSlidesResponse = GetHeroSlidesResult | GetHeroSlidesError;
