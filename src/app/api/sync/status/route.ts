import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const sources = await prisma.dataSource.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(sources);
}
