import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

async function getDefaultUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { name: "Demo用户", email: "demo@linkloop.app" } });
  }
  return user;
}

export async function GET() {
  const user = await getDefaultUser();
  const links = await prisma.linkRelation.findMany({
    where: { fromUserId: user.id },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  if (body.action === "search") {
    const query = body.query?.trim();
    if (!query) return NextResponse.json({ results: [] });
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          { OR: [
            { email: { contains: query } },
            { name: { contains: query } },
          ]},
        ],
      },
      include: { profile: true },
      take: 10,
    });
    return NextResponse.json({
      results: users.map(u => ({
        id: u.id,
        name: u.profile?.displayName || u.name,
        email: u.email,
        company: u.profile?.company || "",
        title: u.profile?.title || "",
        avatar: u.profile?.avatar || u.name[0],
        isLBUser: true,
      })),
    });
  }

  if (body.action === "link") {
    const toUserId = body.toUserId;
    const tags = body.tags || [];
    if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });

    const link = await prisma.linkRelation.upsert({
      where: { fromUserId_toUserId: { fromUserId: user.id, toUserId } },
      update: { tags: JSON.stringify(tags), note: body.note || "" },
      create: { fromUserId: user.id, toUserId, tags: JSON.stringify(tags), note: body.note || "" },
    });

    return NextResponse.json({ link, message: "已 Link" });
  }

  if (body.action === "unlink") {
    await prisma.linkRelation.deleteMany({
      where: { fromUserId: user.id, toUserId: body.toUserId },
    });
    return NextResponse.json({ message: "已取消 Link" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
