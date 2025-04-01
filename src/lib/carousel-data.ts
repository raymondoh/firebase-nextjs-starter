// src/lib/carousel-data.ts
// Define the slide type for better type safety
export interface HeroSlide {
  title: string;
  description: string;
  backgroundImage: string;
  cta?: string;
  ctaHref?: string;
}

// Hero Carousel Data
export const heroSlides: HeroSlide[] = [
  {
    title: "Spring Sale is Here!",
    description: "Get up to 50% off select products. Limited time only.",
    backgroundImage: "/images/hero/hero-1.jpg",
    cta: "Shop Now",
    ctaHref: "/products"
  },
  {
    title: "New Arrivals",
    description: "Check out our latest collection of quality items.",
    backgroundImage: "/images/hero/hero-2.jpg",
    cta: "Browse",
    ctaHref: "/products"
  },
  {
    title: "it's Here!",
    description: "Men all around.",
    backgroundImage: "/images/hero/hero-3.jpg",
    cta: "Browse",
    ctaHref: "/products"
  }
];

// Product type and data for the product carousel
export interface Product {
  id: string | number;
  name: string;
  price: string;
  image: string;
  description?: string;
  badge?: string;
  inStock?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Premium Headphones",
    price: "$299",
    image: "/images/carousel/products/headphones.jpg",
    description: "High-quality wireless headphones with noise cancellation.",
    inStock: true
  },
  {
    id: 2,
    name: "Wireless Earbuds",
    price: "$149",
    image: "/images/carousel/products/earbuds.jpg",
    description: "Compact wireless earbuds with long battery life.",
    badge: "Sale",
    inStock: true
  },
  {
    id: 3,
    name: "Smart Watch",
    price: "$249",
    image: "/images/carousel/products/watch.jpg",
    description: "Feature-rich smartwatch with health tracking.",
    inStock: true
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: "$199",
    image: "/images/carousel/products/speaker.jpg",
    description: "Portable speaker with immersive sound quality.",
    inStock: false
  },
  {
    id: 5,
    name: "Laptop Stand",
    price: "$79",
    image: "/images/carousel/products/stand.jpg",
    description: "Ergonomic laptop stand for better posture.",
    inStock: true
  },
  {
    id: 6,
    name: "Mechanical Keyboard",
    price: "$129",
    image: "/images/carousel/products/keyboard.jpg",
    description: "Tactile mechanical keyboard for better typing experience.",
    badge: "New",
    inStock: true
  }
];
