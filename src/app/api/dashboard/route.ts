import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const [inboxCount, contactCount, overdueCommitments, pendingCommitments, socialFeeds] = await Promise.all([
    prisma.inboxItem.count({ where: { unread: true } }),
    prisma.contact.count(),
    prisma.commitment.findMany({ where: { status: "overdue" }, include: { contact: true } }),
    prisma.commitment.findMany({ where: { status: "pending" }, include: { contact: true } }),
    prisma.socialFeed.count(),
  ]);

  const actionContacts = await prisma.contact.findMany({
    where: { OR: [{ health: { lt: 60 } }, { commitments: { some: { status: { in: ["overdue", "pending"] } } } }] },
    include: {
      commitments: { where: { status: { in: ["overdue", "pending"] } }, orderBy: { createdAt: "desc" } },
      interactions: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { health: "asc" },
  });

  return NextResponse.json({
    metrics: {
      newInfo: inboxCount,
      contacts: contactCount,
      pendingActions: overdueCommitments.length + pendingCommitments.length,
      events: socialFeeds,
    },
    overdueCommitments,
    pendingCommitments,
    actionContacts,
  });
}
