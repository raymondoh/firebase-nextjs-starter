// src/lib/carousel-data.ts
// Define the slide type for better type safety
export interface HeroSlide {
  title: string;
  description: string;
  cta: string;
  ctaHref?: string;
  backgroundImage: string;
}

// Hero Carousel Data
export const heroSlides: HeroSlide[] = [
  {
    title: "Welcome to Your Application",
    description: "A powerful starting point for your next project with authentication, admin dashboard, and more.",
    cta: "Get Started",
    ctaHref: "#",
    backgroundImage: "/images/carousel/hero/hero-1.jpg"
  },
  {
    title: "Powerful Admin Dashboard",
    description: "Manage users, view analytics, and control your application with ease.",
    cta: "Explore Features",
    ctaHref: "#features",
    backgroundImage: "/images/carousel/hero/hero-2.jpg"
  },
  {
    title: "Built with Next.js & Firebase",
    description: "Leverage the power of Next.js and Firebase for a scalable, modern application.",
    cta: "Learn More",
    ctaHref: "#about",
    backgroundImage: "/images/carousel/hero/hero-3.jpg"
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
