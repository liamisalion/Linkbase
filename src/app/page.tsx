"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Tag } from "@/components/Tag";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>;

  const { metrics, overdueCommitments, pendingCommitments, actionContacts } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">早上好！以下是今日需要关注的关系事项</h1>
        <p className="text-gray-500 text-sm mt-1">AI 已完成晨间分析 · 基于邮件、日历、沟通记录和社媒动态综合判断</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard value={metrics.newInfo} label="新增信息" trend="↑ 待处理" trendUp />
        <MetricCard value={metrics.contacts} label="联系人" />
        <MetricCard value={metrics.pendingActions} label="待跟进事项" trend={`${overdueCommitments.length} 项已逾期`} trendUp={false} />
        <MetricCard value={metrics.events} label="社媒动态" />
      </div>

      <h2 className="text-lg font-bold mb-3">高优先级跟进</h2>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {actionContacts.length === 0 && (
          <div className="text-center py-12 text-gray-400">暂无待处理事项</div>
        )}
        {actionContacts.map((c: any) => (
          <Link key={c.id} href={`/contacts/${c.id}`}
            className="flex gap-3.5 items-start p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center font-bold text-base shrink-0">
              {c.avatar || c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{c.name}</span>
                <div className="flex gap-1.5">
                  {c.commitments.some((cm: any) => cm.status === "overdue") && <Tag color="red">已逾期</Tag>}
                  {c.health < 50 && <Tag color="yellow">关系冷却</Tag>}
                  <Tag color="blue">{c.stage}</Tag>
                </div>
              </div>
              <div className="text-sm text-gray-500">{c.company} · {c.title}</div>
              {c.commitments[0] && (
                <div className="text-sm text-gray-600 mt-1">{c.commitments[0].direction === "mine" ? "我需要：" : "等待对方："}{c.commitments[0].what}</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
