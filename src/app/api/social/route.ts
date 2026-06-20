import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const feeds = await prisma.socialFeed.findMany({
    include: { contact: { select: { id: true, name: true, company: true, avatar: true, stage: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(feeds);
}
