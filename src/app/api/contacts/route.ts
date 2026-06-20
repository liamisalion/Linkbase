import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const contacts = await prisma.contact.findMany({
    where: type && type !== "全部" ? { type } : undefined,
    include: { interactions: { orderBy: { date: "desc" }, take: 1 }, _count: { select: { interactions: true, commitments: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { name: "Demo用户", email: "demo@linkloop.app" } });
  }
  const contact = await prisma.contact.create({
    data: {
      userId: user.id,
      name: body.name,
      company: body.company || "",
      title: body.title || "",
      type: body.type || "其他",
      avatar: body.name?.[0] || "?",
      notes: body.notes || "",
      email: body.email || "",
      wechat: body.wechat || "",
      linkedin: body.linkedin || "",
      interests: JSON.stringify(body.interests || []),
    },
  });
  return NextResponse.json(contact, { status: 201 });
}
