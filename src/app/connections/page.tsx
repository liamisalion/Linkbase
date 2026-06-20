"use client";

import { useEffect, useState } from "react";

interface DataSourceInfo {
  id: string;
  type: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  lastSyncAt: string | null;
  available: boolean;
}

const ALL_SOURCES: Omit<DataSourceInfo, "connected" | "lastSyncAt">[] = [
  { id: "gmail", type: "gmail", name: "Gmail", icon: "📧", description: "自动同步邮件，AI 提取联系人和事件", available: true },
  { id: "gcal", type: "gcal", name: "Google Calendar", icon: "📅", description: "同步日历事件，自动生成会前简报", available: true },
  { id: "outlook", type: "outlook", name: "Outlook / Microsoft 365", icon: "📨", description: "同步 Outlook 邮件和日历", available: false },
  { id: "github", type: "github", name: "GitHub", icon: "🐙", description: "关注项目动态和开发者活动", available: false },
  { id: "linkedin", type: "linkedin", name: "LinkedIn", icon: "💼", description: "需要浏览器插件抓取（计划中）", available: false },
  { id: "wechat", type: "wechat", name: "微信", icon: "💬", description: "通过导出聊天记录文件导入", available: false },
  { id: "feishu", type: "feishu", name: "飞书", icon: "🐦", description: "需要企业管理员授权（计划中）", available: false },
  { id: "dingtalk", type: "dingtalk", name: "钉钉", icon: "📌", description: "需要企业管理员授权（计划中）", available: false },
];

export default function ConnectionsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    try {
      const res = await fetch("/api/sync/status");
      const data = await res.json();
      setSources(data);
    } catch {}
  }

  function isConnected(type: string) {
    return sources.some(s => s.type === type && s.status === "connected");
  }

  function getLastSync(type: string) {
    const s = sources.find(s => s.type === type);
    return s?.lastSyncAt ? new Date(s.lastSyncAt).toLocaleString("zh-CN") : null;
  }

  async function handleAction(type: string, action: string) {
    const endpoint = type === "gcal" ? "/api/sync/calendar" : `/api/sync/${type}`;
    setLoading(`${type}-${action}`);
    setMessage(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setMessage({ type: res.ok ? "success" : "error", text: data.message || data.error });
      await loadStatus();
    } catch {
      setMessage({ type: "error", text: "操作失败" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">数据源连接</h1>
        <p className="text-gray-500 text-sm mt-1">
          连接邮箱、日历、社媒等数据源，自动汇总关系信息
        </p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? "✓" : "✗"} {message.text}
        </div>
      )}

      <div className="space-y-3">
        {ALL_SOURCES.map((src) => {
          const connected = isConnected(src.type);
          const lastSync = getLastSync(src.type);
          return (
            <div key={src.id} className={`bg-white border rounded-xl p-5 shadow-sm flex items-center gap-4 ${!src.available ? "opacity-60" : ""} ${connected ? "border-green-200" : "border-gray-200"}`}>
              <div className="text-3xl">{src.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{src.name}</span>
                  {connected && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">已连接</span>}
                  {!src.available && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">计划中</span>}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{src.description}</div>
                {lastSync && <div className="text-xs text-gray-400 mt-1">上次同步: {lastSync}</div>}
              </div>
              {src.available && (
                <div className="flex gap-2">
                  {connected ? (
                    <>
                      <button
                        onClick={() => handleAction(src.type, "sync")}
                        disabled={loading === `${src.type}-sync`}
                        className="px-4 py-2 bg-[var(--blue)] text-white rounded-lg text-sm font-semibold hover:bg-[#084c91] disabled:opacity-50 transition-colors"
                      >
                        {loading === `${src.type}-sync` ? "同步中..." : "立即同步"}
                      </button>
                      <button
                        onClick={() => handleAction(src.type, "disconnect")}
                        disabled={loading === `${src.type}-disconnect`}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        断开
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction(src.type, "connect")}
                      disabled={loading === `${src.type}-connect`}
                      className="px-4 py-2 border-2 border-[var(--blue)] text-[var(--blue)] rounded-lg text-sm font-semibold hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    >
                      {loading === `${src.type}-connect` ? "连接中..." : "连接"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600 space-y-2">
        <h4 className="font-bold text-gray-800">关于数据源连接</h4>
        <p>当前 Gmail 和 Google Calendar 为<strong>演示模式</strong>，展示连接和同步流程。</p>
        <p>生产环境需要在 Google Cloud Console 创建 OAuth 2.0 凭据，并配置对应的 Client ID 和 Client Secret。</p>
        <p>不支持直接 API 的平台（微信、脉脉等），可通过<strong>数据导入</strong>页面手动上传聊天记录文件。</p>
      </div>
    </div>
  );
}
