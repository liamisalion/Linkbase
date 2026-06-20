"use client";

import { useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Tag } from "@/components/Tag";
import Link from "next/link";

export default function CommitmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(true);

  const load = (f: string) => {
    setFilter(f);
    setLoading(true);
    const q = f === "全部" ? "" : `?filter=${f}`;
    fetch(`/api/commitments${q}`).then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  };

  useEffect(() => { load("全部"); }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">承诺清单</h1>
        <p className="text-gray-500 text-sm mt-1">追踪双方承诺过的事，减少"答应了但忘做"的情况</p>
      </div>
      <FilterBar filters={["全部", "我答应的", "对方答应的", "已逾期"]} active={filter} onChange={load} />
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="text-left text-sm text-gray-500 bg-gray-50">
              <th className="px-4 py-3 font-semibold">方向</th>
              <th className="px-4 py-3 font-semibold">联系人</th>
              <th className="px-4 py-3 font-semibold">承诺事项</th>
              <th className="px-4 py-3 font-semibold">截止时间</th>
              <th className="px-4 py-3 font-semibold">状态</th>
              <th className="px-4 py-3 font-semibold">来源</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">加载中...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">暂无承诺事项</td></tr>
            ) : items.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><Tag color={c.direction === "mine" ? "blue" : "purple"}>{c.direction === "mine" ? "我答应的" : "对方答应的"}</Tag></td>
                <td className="px-4 py-3 font-bold text-sm">
                  {c.contact ? <Link href={`/contacts/${c.contact.id}`} className="hover:text-[var(--blue)]">{c.contact.name}</Link> : "-"}
                </td>
                <td className="px-4 py-3 text-sm">{c.what}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{c.deadline}</td>
                <td className="px-4 py-3">
                  {c.status === "overdue" && <span className="text-red-600 font-bold text-sm">⚠️ 已逾期</span>}
                  {c.status === "done" && <span className="text-green-600 font-bold text-sm">✅ 已完成</span>}
                  {c.status === "pending" && <span className="text-yellow-600 font-bold text-sm">🔶 待处理</span>}
                  {c.status === "waiting" && <span className="text-gray-500 font-bold text-sm">⏳ 等待触发</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
