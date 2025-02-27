"use client";
import { useSession } from "next-auth/react";
export default function AboutPage() {
  const { data: session } = useSession();
  console.log("Client-side session:", session);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="mb-4">Welcome to our About page. Here you can learn more about our company, mission, and values.</p>
      <p>We are dedicated to providing high-quality services and innovative solutions to our customers.</p>
    </div>
  );
}
