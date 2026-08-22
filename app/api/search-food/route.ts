import { NextRequest, NextResponse } from "next/server";
import { searchMyFcd } from "@/lib/food-search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ results: [] });
  }
  const result = searchMyFcd(q);
  return NextResponse.json({ results: result ? [result] : [] });
}
