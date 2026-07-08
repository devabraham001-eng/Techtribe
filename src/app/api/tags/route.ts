import { NextResponse } from "next/server";
import { DEMO_TAGS } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await new Promise((r) => setTimeout(r, 200));
  return NextResponse.json({ tags: DEMO_TAGS });
}