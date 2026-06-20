"use client";

import { useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { HealthBar } from "@/components/HealthBar";
import { Tag } from "@/components/Tag";
import Link from "next/link";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(true);

  const load = (type: string) => {
    setFilter(type);
    setLoading(true);
    fetch(`/api/contacts?type=${type}`).then(r => r.json()).then(d => { setContacts(d); setLoading(false); });
  };

  useEffect(() => { load("全部"); }, []);

  const stageColor = (s: string) => {
    if (s.includes("评估") || s.includes("对接")) return "yellow";
    if (s.includes("等待")) return "red";
    if (s.includes("初次") || s.includes("重新")) return "purple";
    return "green";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">联系人管理</h1>
        <p className="text-gray-500 text-sm mt-1">重要联系人的持久化关系档案，越用越懂上下文</p>
      </div>
      <FilterBar filters={["全部", "客户", "投资人", "HR", "合作方", "人脉"]} active={filter} onChange={load} />
      {loading ? (
        <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {contacts.map((c) => (
            <Link key={c.id} href={`/contacts/${c.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow block">
              <div className="flex gap-3 items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center font-bold">
                  {c.avatar || c.name[0]}
                </div>
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.company} · {c.title}</div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                <Tag color="blue">{c.type}</Tag>
                <Tag color={stageColor(c.stage)}>{c.stage}</Tag>
              </div>
              <HealthBar score={c.health} size="sm" />
              <div className="flex justify-between text-xs text-gray-400 mt-2.5">
                <span>互动 {c._count?.interactions || 0} 次</span>
                <span>频率：{c.frequency}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
