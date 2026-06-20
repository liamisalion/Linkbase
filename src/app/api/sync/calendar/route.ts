import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "connect") {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Demo用户", email: "demo@linkloop.app" } });
    }

    const existing = await prisma.dataSource.findFirst({ where: { type: "gcal" } });
    if (existing) {
      await prisma.dataSource.update({
        where: { id: existing.id },
        data: { status: "connected" },
      });
    } else {
      await prisma.dataSource.create({
        data: { userId: user.id, type: "gcal", status: "connected" },
      });
    }

    return NextResponse.json({
      status: "connected",
      message: "Google Calendar 已连接（演示模式）",
    });
  }

  if (action === "disconnect") {
    await prisma.dataSource.deleteMany({ where: { type: "gcal" } });
    return NextResponse.json({ status: "disconnected", message: "Google Calendar 已断开" });
  }

  if (action === "sync") {
    const ds = await prisma.dataSource.findFirst({ where: { type: "gcal" } });
    if (!ds || ds.status !== "connected") {
      return NextResponse.json({ error: "Google Calendar 未连接" }, { status: 400 });
    }

    const sampleEvents = [
      {
        source: "日历",
        title: "[Calendar 同步] 周一项目评审会议",
        preview: "通过 Google Calendar API 同步的示例会议。参会人：陈工、产品经理。生产环境中系统会自动匹配参会人与联系人并生成会前简报。",
        tags: JSON.stringify(["Calendar同步", "会议", "示例"]),
        time: "下周一 14:00",
      },
    ];

    for (const event of sampleEvents) {
      await prisma.inboxItem.create({ data: event });
    }

    await prisma.dataSource.update({
      where: { id: ds.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      status: "synced",
      message: `同步完成（演示模式），已导入 ${sampleEvents.length} 个日历事件`,
      syncedCount: sampleEvents.length,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  const ds = await prisma.dataSource.findFirst({ where: { type: "gcal" } });
  return NextResponse.json({
    connected: ds?.status === "connected",
    lastSyncAt: ds?.lastSyncAt,
    status: ds?.status || "disconnected",
  });
}
