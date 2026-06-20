import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source");
  const items = await prisma.inboxItem.findMany({
    where: source && source !== "全部" ? { source } : undefined,
    include: { contact: { select: { id: true, name: true, company: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.inboxItem.create({
    data: {
      contactId: body.contactId || null,
      source: body.source,
      title: body.title,
      preview: body.preview,
      tags: JSON.stringify(body.tags || []),
      time: body.time || "刚刚",
    },
  });
  return NextResponse.json(item, { status: 201 });
}
