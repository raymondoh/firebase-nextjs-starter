import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with us"
};

export default function ContactPage() {
  return (
    <div className="container max-w-6xl mx-auto p-8 space-y-4">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-4">We'd love to hear from you. Please use the information below to get in touch with us.</p>
      <div>
        <p>Email: contact@example.com</p>
        <p>Phone: (123) 456-7890</p>
        <p>Address: 123 Main St, Anytown, USA 12345</p>
      </div>
    </div>
  );
}
