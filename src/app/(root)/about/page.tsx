import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Your App Name",
  description:
    "Learn about our mission, team, and the story behind Your App Name. Discover how we're helping users achieve their goals.",
  openGraph: {
    title: "About Us | Your App Name",
    description: "Learn about our mission, team, and the story behind Your App Name.",
    type: "website",
    images: [
      {
        url: "/images/about-og-image.jpg", // Replace with your actual image path
        width: 1200,
        height: 630,
        alt: "About Your App Name"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Your App Name",
    description: "Learn about our mission, team, and the story behind Your App Name.",
    images: ["/images/about-twitter-image.jpg"] // Replace with your actual image path
  },
  keywords: ["about us", "company", "team", "mission", "your app name", "app story"],
  alternates: {
    canonical: "https://yourapp.com/about"
  }
};

export default function AboutPage() {
  return (
    <div className="container max-w-6xl mx-auto p-8 space-y-4">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p>Welcome to our About page. Here you can learn more about our company, mission, and values.</p>
      <p>We are dedicated to providing high-quality services and innovative solutions to our customers.</p>
      <p>
        Aperiam incidunt eius, nihil, nulla quasi perferendis. Architecto atque aut reiciendis alias earum aliquid odit
        quia, uo optio explicabo perspiciatis veritatis, natus laudantium dolore.
      </p>
      <p>
        aperiam incidunt eius, nihil, nulla quasi perferendis. Architecto atque aut reiciendis alias earum aliquid odit
        quia, uo optio explicabo perspiciatis veritatis, natus laudantium dolore.
      </p>
    </div>
  );
}
