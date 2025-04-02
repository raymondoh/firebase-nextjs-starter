import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our team and mission"
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
