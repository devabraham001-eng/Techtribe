import { NextResponse } from "next/server";
import { getBlogCategories } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getBlogCategories();
  return NextResponse.json({ categories });
}
