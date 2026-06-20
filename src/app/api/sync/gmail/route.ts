import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "connect") {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Demo用户", email: "demo@linkbase.app" } });
    }

    const existing = await prisma.dataSource.findFirst({ where: { type: "gmail" } });
    if (existing) {
      await prisma.dataSource.update({
        where: { id: existing.id },
        data: { status: "connected", credentials: JSON.stringify({ note: "OAuth token would be stored here" }) },
      });
    } else {
      await prisma.dataSource.create({
        data: { userId: user.id, type: "gmail", status: "connected", credentials: JSON.stringify({ note: "OAuth token would be stored here" }) },
      });
    }

    return NextResponse.json({
      status: "connected",
      message: "Gmail 已连接（演示模式）。生产环境将使用 Google OAuth 2.0 授权。",
      note: "生产环境实现步骤：1) Google Cloud Console 创建 OAuth 凭据 2) 配置 redirect URI 3) 请求 gmail.readonly + calendar.readonly scope 4) 存储 refresh_token",
    });
  }

  if (action === "disconnect") {
    await prisma.dataSource.deleteMany({ where: { type: "gmail" } });
    return NextResponse.json({ status: "disconnected", message: "Gmail 已断开连接" });
  }

  if (action === "sync") {
    const ds = await prisma.dataSource.findFirst({ where: { type: "gmail" } });
    if (!ds || ds.status !== "connected") {
      return NextResponse.json({ error: "Gmail 未连接" }, { status: 400 });
    }

    const sampleEmails = [
      {
        source: "邮件",
        title: "[Gmail 同步] 项目进度更新",
        preview: "这是通过 Gmail API 同步的示例邮件。生产环境中，系统会自动拉取最近 30 天的邮件并通过 AI 提取关键信息。",
        tags: JSON.stringify(["Gmail同步", "示例"]),
        time: new Date().toLocaleString("zh-CN"),
      },
    ];

    for (const email of sampleEmails) {
      await prisma.inboxItem.create({ data: email });
    }

    await prisma.dataSource.update({
      where: { id: ds.id },
      data: { lastSyncAt: new Date(), status: "connected" },
    });

    return NextResponse.json({
      status: "synced",
      message: `同步完成（演示模式），已导入 ${sampleEmails.length} 封邮件`,
      syncedCount: sampleEmails.length,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET() {
  const ds = await prisma.dataSource.findFirst({ where: { type: "gmail" } });
  return NextResponse.json({
    connected: ds?.status === "connected",
    lastSyncAt: ds?.lastSyncAt,
    status: ds?.status || "disconnected",
  });
}
