import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const interaction = await prisma.interaction.create({
    data: {
      contactId: body.contactId,
      channel: body.channel || "聊天",
      summary: body.summary,
      date: body.date ? new Date(body.date) : new Date(),
    },
  });
  const contact = await prisma.contact.findUnique({ where: { id: body.contactId } });
  if (contact) {
    await prisma.contact.update({
      where: { id: body.contactId },
      data: {
        lastContactAt: new Date(),
        health: Math.min(100, contact.health + 5),
      },
    });
  }
  return NextResponse.json(interaction, { status: 201 });
}
