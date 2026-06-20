"use client";

import { useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Tag } from "@/components/Tag";
import Link from "next/link";

const sourceIcons: Record<string, string> = {
  "邮件": "📧", "日历": "📅", "会议纪要": "📝", "聊天": "💬", "社媒": "🌐", "文件": "📎"
};

export default function InboxPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("全部");
  const [loading, setLoading] = useState(true);

  const load = (source: string) => {
    setFilter(source);
    setLoading(true);
    fetch(`/api/inbox?source=${source}`).then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  };

  useEffect(() => { load("全部"); }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">信息收件箱</h1>
        <p className="text-gray-500 text-sm mt-1">自动汇总多个来源的信息，AI 提取联系人、事件、承诺和时间节点</p>
      </div>
      <FilterBar filters={["全部", "邮件", "日历", "会议纪要", "聊天", "社媒", "文件"]} active={filter} onChange={load} />
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {loading ? (
          <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无信息</div>
        ) : items.map((item) => {
          const tags: string[] = (() => { try { return JSON.parse(item.tags); } catch { return []; } })();
          return (
            <div key={item.id} className={`flex gap-3 items-start p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${item.contactId ? 'cursor-pointer' : ''}`}>
              {item.unread && <div className="w-2 h-2 rounded-full bg-[var(--blue)] mt-2 shrink-0" />}
              {!item.unread && <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0" />}
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-base shrink-0">
                {sourceIcons[item.source] || "📄"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-sm text-gray-500 line-clamp-2">{item.preview}</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {tags.map((t, i) => <span key={i} className="text-[11px] px-1.5 py-0.5 bg-blue-50 text-[var(--blue)] rounded font-semibold">{t}</span>)}
                </div>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
