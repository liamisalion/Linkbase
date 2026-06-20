"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/components/Tag";
import Link from "next/link";

export default function WaitingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commitments").then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  }, []);

  const waitingForMe = items.filter(i => i.direction === "mine" && i.status !== "done");
  const waitingForThem = items.filter(i => i.direction === "theirs" && i.status !== "done");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">谁在等我 / 我在等谁</h1>
        <p className="text-gray-500 text-sm mt-1">双向追踪待处理和待反馈事项，避免遗漏</p>
      </div>
      {loading ? (
        <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="font-bold p-4 border-b border-gray-200 flex items-center gap-2">
              🔴 谁在等我
              <span className="bg-[var(--blue)] text-white text-xs px-2 py-0.5 rounded-full">{waitingForMe.length}</span>
            </h3>
            {waitingForMe.map(w => (
              <Link key={w.id} href={w.contact ? `/contacts/${w.contact.id}` : "#"}
                className="block p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">{w.contact?.name || "未知"} · {w.contact?.company || ""}</span>
                  <span className={`text-xs font-bold ${w.status === "overdue" ? "text-red-600" : "text-yellow-600"}`}>{w.deadline}</span>
                </div>
                <div className="text-sm text-gray-500">{w.what}</div>
              </Link>
            ))}
            {waitingForMe.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">暂无待处理</div>}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <h3 className="font-bold p-4 border-b border-gray-200 flex items-center gap-2">
              🟡 我在等谁
              <span className="bg-[var(--blue)] text-white text-xs px-2 py-0.5 rounded-full">{waitingForThem.length}</span>
            </h3>
            {waitingForThem.map(w => (
              <Link key={w.id} href={w.contact ? `/contacts/${w.contact.id}` : "#"}
                className="block p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">{w.contact?.name || "未知"} · {w.contact?.company || ""}</span>
                  <span className={`text-xs font-bold ${w.status === "overdue" ? "text-red-600" : "text-yellow-600"}`}>{w.deadline}</span>
                </div>
                <div className="text-sm text-gray-500">{w.what}</div>
              </Link>
            ))}
            {waitingForThem.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">暂无等待中</div>}
          </div>
        </div>
      )}
    </div>
  );
}
