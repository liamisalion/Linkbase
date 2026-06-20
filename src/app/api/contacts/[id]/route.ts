import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      interactions: { orderBy: { date: "desc" } },
      commitments: { orderBy: { createdAt: "desc" } },
      socialFeeds: { orderBy: { createdAt: "desc" } },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.company !== undefined) data.company = body.company;
  if (body.title !== undefined) data.title = body.title;
  if (body.type !== undefined) data.type = body.type;
  if (body.stage !== undefined) data.stage = body.stage;
  if (body.health !== undefined) data.health = body.health;
  if (body.frequency !== undefined) data.frequency = body.frequency;
  if (body.interests !== undefined) data.interests = JSON.stringify(body.interests);
  if (body.notes !== undefined) data.notes = body.notes;
  const contact = await prisma.contact.update({ where: { id }, data });
  return NextResponse.json(contact);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
