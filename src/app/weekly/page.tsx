"use client";

import { useEffect, useState } from "react";
import { HealthBar } from "@/components/HealthBar";
import Link from "next/link";

export default function WeeklyPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/contacts").then(r => r.json()),
      fetch("/api/commitments").then(r => r.json()),
    ]).then(([c, cm]) => {
      setContacts(c);
      setCommitments(cm);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>;

  const doneCount = commitments.filter((c: any) => c.status === "done").length;
  const pendingCount = commitments.filter((c: any) => c.status === "pending" || c.status === "overdue").length;
  const coldContacts = contacts.filter((c: any) => c.health < 50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">本周关系进展报告</h1>
        <p className="text-gray-500 text-sm mt-1">AI 自动生成 · {new Date().toLocaleDateString("zh-CN")}</p>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { val: contacts.length, lbl: "联系人" },
          { val: contacts.filter((c: any) => c.stage === "初次接触").length, lbl: "新增" },
          { val: doneCount, lbl: "完成承诺" },
          { val: pendingCount, lbl: "待处理" },
          { val: coldContacts.length, lbl: "需关注" },
        ].map((s, i) => (
          <div key={i} className="text-center bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-extrabold text-[var(--blue)]">{s.val}</div>
            <div className="text-xs text-gray-500 mt-1">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
        <h3 className="font-bold mb-3">📊 联系人健康度排行</h3>
        {contacts.sort((a: any, b: any) => b.health - a.health).map((c: any) => (
          <Link key={c.id} href={`/contacts/${c.id}`}
            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center font-bold text-sm">
              {c.avatar || c.name[0]}
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm">{c.name}</span>
              <span className="text-xs text-gray-400 ml-2">{c.company}</span>
            </div>
            <div className="w-28"><HealthBar score={c.health} size="sm" /></div>
          </Link>
        ))}
      </div>

      {coldContacts.length > 0 && (
        <div className="bg-white border-l-[3px] border-red-500 border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
          <h3 className="font-bold mb-3 text-red-600">⚠️ 冷却关系提醒</h3>
          {coldContacts.map((c: any) => (
            <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-3 py-2 hover:opacity-80">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">{c.avatar || c.name[0]}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{c.name}</div>
                <div className="text-xs text-gray-500">{c.stage}</div>
              </div>
              <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">需关注</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
