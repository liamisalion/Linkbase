"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/components/Tag";
import Link from "next/link";

const platformClass: Record<string, string> = {
  LinkedIn: "bg-blue-50 text-[#0a66c2]",
  X: "bg-gray-100 text-gray-800",
  GitHub: "bg-gray-100 text-gray-800",
};

export default function SocialPage() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/social").then(r => r.json()).then(d => { setFeeds(d); setLoading(false); });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">关注账号动态</h1>
        <p className="text-gray-500 text-sm mt-1">关注重要联系人、公司和项目的公开动态，AI 识别关系事件并推荐行动</p>
      </div>
      {loading ? (
        <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>
      ) : (
        <div className="space-y-4">
          {feeds.map((f) => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex gap-3 items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center font-bold">
                  {f.person[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{f.person}</div>
                  <div className="text-sm text-gray-500">{f.company}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${platformClass[f.platform] || "bg-gray-100"}`}>{f.platform}</span>
                <span className="text-xs text-gray-400">{f.time}</span>
              </div>
              <div className="text-sm leading-relaxed bg-gray-50 rounded-lg p-3.5 mb-3 whitespace-pre-line">{f.content}</div>
              {f.aiAnalysis && (
                <div className="border-l-[3px] border-[var(--blue)] bg-blue-50 rounded-lg p-3.5">
                  <div className="text-xs font-bold text-[var(--blue)] mb-1">🤖 AI 分析 · {f.aiEvent}</div>
                  <p className="text-sm text-gray-700 mb-2">{f.aiAnalysis}</p>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <Tag color="blue">💡 {f.aiAction}</Tag>
                    {f.contact && <Link href={`/contacts/${f.contact.id}`} className="text-sm font-semibold text-[var(--blue)] hover:underline">查看关系档案</Link>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
