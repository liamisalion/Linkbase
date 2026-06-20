"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { icon: "📊", label: "今日行动中心", href: "/" },
  { icon: "📥", label: "信息收件箱", href: "/inbox" },
  { icon: "👤", label: "联系人管理", href: "/contacts" },
  { icon: "⏳", label: "谁在等我 / 我在等谁", href: "/waiting" },
  { icon: "📋", label: "承诺清单", href: "/commitments" },
  { icon: "🌐", label: "关注账号动态", href: "/social" },
  { icon: "📈", label: "周报", href: "/weekly" },
  { icon: "🤖", label: "AI 分析", href: "/ai" },
  { icon: "📤", label: "数据导入", href: "/import" },
  { icon: "🔌", label: "数据源连接", href: "/connections" },
  { icon: "⚙️", label: "AI 设置", href: "/settings" },
];

interface AIStatus {
  configured: boolean;
  model: string | null;
  provider: string | null;
  status: string;
  message: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then(setAiStatus)
      .catch(() => setAiStatus({ configured: false, model: null, provider: null, status: "未知", message: "无法获取状态" }));
  }, []);

  const statusColor = aiStatus?.status === "已连接"
    ? "bg-green-400"
    : aiStatus?.status === "已配置"
      ? "bg-yellow-400"
      : aiStatus?.status === "Key 无效"
        ? "bg-red-400"
        : "bg-gray-500";

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#101828] text-white flex flex-col">
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--blue)] flex items-center justify-center text-sm font-bold">
          LB
        </div>
        <span className="text-lg font-semibold tracking-tight">LinkBase 常联系</span>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {aiStatus && (
        <Link href="/settings" className="block mx-3 mb-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${statusColor} shrink-0`} />
            <span className="text-xs font-semibold text-gray-200">AI {aiStatus.status}</span>
          </div>
          {aiStatus.model && (
            <div className="text-[11px] text-gray-400 pl-4">
              {aiStatus.provider} / {aiStatus.model}
            </div>
          )}
          {!aiStatus.configured && (
            <div className="text-[11px] text-gray-500 pl-4">
              点击配置 AI →
            </div>
          )}
        </Link>
      )}

      <div className="px-5 py-4 text-xs text-gray-500">
        © 2026 LinkBase 常联系
      </div>
    </aside>
  );
}
