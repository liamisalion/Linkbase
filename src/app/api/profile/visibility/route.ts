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
  const rules = await prisma.visibilityRule.findMany({ where: { userId: user.id } });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const user = await getDefaultUser();
  const body = await req.json();
  const { rules } = body;

  if (!Array.isArray(rules)) {
    return NextResponse.json({ error: "rules must be an array" }, { status: 400 });
  }

  await prisma.visibilityRule.deleteMany({ where: { userId: user.id } });

  const created = [];
  for (const rule of rules) {
    const r = await prisma.visibilityRule.create({
      data: {
        userId: user.id,
        field: rule.field,
        level: rule.level || "linked",
        allowTags: JSON.stringify(rule.allowTags || []),
        denyTags: JSON.stringify(rule.denyTags || []),
      },
    });
    created.push(r);
  }

  return NextResponse.json({ rules: created, message: "可见性规则已保存" });
}
