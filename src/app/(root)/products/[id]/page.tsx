// src/app/products/[id]/page.tsx

import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/firebase/admin/products";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProductById(id);

  if (!result.success) {
    return notFound();
  }

  const product = result.product;

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <h1 className="text-3xl font-bold">{product.name}</h1>

      <div className="relative w-full max-w-md h-[300px] mt-6 rounded overflow-hidden border bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-contain p-2"
        />
      </div>

      <p className="text-muted-foreground mt-4">{product.description}</p>

      <p className="mt-6 text-xl font-semibold">${product.price.toFixed(2)}</p>

      {product.badge && (
        <span className="inline-block mt-4 bg-blue-100 text-blue-700 px-2 py-1 rounded">{product.badge}</span>
      )}
    </div>
  );
}
