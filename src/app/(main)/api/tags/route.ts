import { NextResponse } from "next/server";
import { getBlogTags } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const tags = await getBlogTags();
  return NextResponse.json({ tags });
}
