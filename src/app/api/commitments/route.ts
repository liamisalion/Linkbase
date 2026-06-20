import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get("filter");
  let where: Record<string, unknown> = {};
  if (filter === "我答应的") where = { direction: "mine" };
  else if (filter === "对方答应的") where = { direction: "theirs" };
  else if (filter === "已逾期") where = { status: "overdue" };

  const items = await prisma.commitment.findMany({
    where,
    include: { contact: { select: { id: true, name: true, company: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.commitment.create({
    data: {
      contactId: body.contactId,
      direction: body.direction || "mine",
      what: body.what,
      deadline: body.deadline || "",
      status: body.status || "pending",
      source: body.source || "",
    },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.commitment.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json(item);
}
