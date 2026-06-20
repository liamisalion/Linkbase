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
  let profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId: user.id, displayName: user.name, emails: JSON.stringify([user.email]) },
    });
  }
  const rules = await prisma.visibilityRule.findMany({ where: { userId: user.id } });
  return NextResponse.json({ profile, rules });
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();

  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: body.displayName ?? undefined,
      bio: body.bio ?? undefined,
      avatar: body.avatar ?? undefined,
      emails: body.emails ? JSON.stringify(body.emails) : undefined,
      phones: body.phones ? JSON.stringify(body.phones) : undefined,
      wechat: body.wechat ?? undefined,
      linkedin: body.linkedin ?? undefined,
      twitter: body.twitter ?? undefined,
      github: body.github ?? undefined,
      maimai: body.maimai ?? undefined,
      feishu: body.feishu ?? undefined,
      dingtalk: body.dingtalk ?? undefined,
      website: body.website ?? undefined,
      company: body.company ?? undefined,
      title: body.title ?? undefined,
      customFields: body.customFields ? JSON.stringify(body.customFields) : undefined,
    },
    create: {
      userId: user.id,
      displayName: body.displayName || user.name,
      emails: body.emails ? JSON.stringify(body.emails) : JSON.stringify([user.email]),
      wechat: body.wechat || "",
      linkedin: body.linkedin || "",
      twitter: body.twitter || "",
      github: body.github || "",
      company: body.company || "",
      title: body.title || "",
    },
  });

  return NextResponse.json({ profile, message: "名片已保存" });
}
