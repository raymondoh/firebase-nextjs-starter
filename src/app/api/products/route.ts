// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { getAllProducts } from "@/firebase/actions";

export async function GET() {
  try {
    const result = await getAllProducts();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/products:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
