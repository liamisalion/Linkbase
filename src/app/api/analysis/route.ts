import { NextRequest, NextResponse } from "next/server";
import { analyzeInformation } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const text = body.text;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const results = await analyzeInformation(text);
  return NextResponse.json({ results });
}
