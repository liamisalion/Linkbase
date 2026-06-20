"use client";

import { useState } from "react";
import { Tag } from "@/components/Tag";

export default function LinkPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ name: "", company: "", title: "", type: "其他", email: "", wechat: "", linkedin: "", notes: "" });

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setMessage(null);
    try {
      const res = await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query }),
      });
      const data = await res.json();
      setResults(data.results || []);
      if (data.results?.length === 0) {
        setShowManual(true);
      }
    } catch {
      setMessage({ type: "error", text: "搜索失败" });
    } finally {
      setSearching(false);
    }
  }

  async function handleLink(userId: string, userName: string) {
    try {
      await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", toUserId: userId, tags: [] }),
      });
      setMessage({ type: "success", text: `已成功 Link ${userName}` });
    } catch {
      setMessage({ type: "error", text: "Link 失败" });
    }
  }

  async function handleManualCreate() {
    if (!manual.name.trim()) return;
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manual.name,
          company: manual.company,
          title: manual.title,
          type: manual.type,
          notes: manual.notes,
          email: manual.email,
          wechat: manual.wechat,
          linkedin: manual.linkedin,
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `手动联系人 ${manual.name} 已创建` });
        setManual({ name: "", company: "", title: "", type: "其他", email: "", wechat: "", linkedin: "", notes: "" });
        setShowManual(false);
      }
    } catch {
      setMessage({ type: "error", text: "创建失败" });
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Link 联系人</h1>
        <p className="text-gray-500 text-sm mt-1">搜索 LinkLoop 用户直接 Link，或快速创建手动联系人</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold mb-3">搜索 LinkLoop 用户</h3>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="输入邮箱或姓名搜索..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100"
            />
            <button onClick={handleSearch} disabled={searching}
              className="px-5 py-2.5 bg-[var(--blue)] text-white rounded-lg text-sm font-bold hover:bg-[#084c91] disabled:opacity-50">
              {searching ? "搜索中..." : "搜索"}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center font-bold">
                    {r.avatar || r.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{r.name}</span>
                      <Tag color="blue">LL 用户</Tag>
                    </div>
                    <div className="text-xs text-gray-500">{r.company} {r.title ? `· ${r.title}` : ""}</div>
                  </div>
                  <button onClick={() => handleLink(r.id, r.name)}
                    className="px-4 py-1.5 border-2 border-[var(--blue)] text-[var(--blue)] rounded-lg text-sm font-bold hover:bg-blue-50">
                    Link
                  </button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !searching && query && (
            <div className="mt-4 text-center py-6 text-gray-400 text-sm">
              未找到匹配的 LinkLoop 用户
              <button onClick={() => setShowManual(true)}
                className="block mx-auto mt-2 text-[var(--blue)] font-semibold hover:underline">
                创建手动联系人 →
              </button>
            </div>
          )}
        </div>

        {/* Manual create */}
        {showManual && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">快速创建手动联系人</h3>
              <Tag color="gray">手动</Tag>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">姓名 *</label>
                  <input value={manual.name} onChange={e => setManual(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">公司</label>
                  <input value={manual.company} onChange={e => setManual(p => ({ ...p, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">职位</label>
                  <input value={manual.title} onChange={e => setManual(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">类型</label>
                  <select value={manual.type} onChange={e => setManual(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]">
                    <option>客户</option><option>投资人</option><option>HR</option><option>合作方</option><option>人脉</option><option>同事</option><option>朋友</option><option>其他</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <label className="block text-xs font-semibold text-gray-500 mb-2">关联账号（可选）</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">📧 邮箱</div>
                    <input value={manual.email} onChange={e => setManual(p => ({ ...p, email: e.target.value }))} placeholder="email"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">💬 微信</div>
                    <input value={manual.wechat} onChange={e => setManual(p => ({ ...p, wechat: e.target.value }))} placeholder="微信号"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">💼 LinkedIn</div>
                    <input value={manual.linkedin} onChange={e => setManual(p => ({ ...p, linkedin: e.target.value }))} placeholder="LinkedIn"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">备注</label>
                <textarea value={manual.notes} onChange={e => setManual(p => ({ ...p, notes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
              </div>
              <button onClick={handleManualCreate} disabled={!manual.name.trim()}
                className="w-full bg-[var(--blue)] text-white rounded-lg py-2.5 font-bold text-sm hover:bg-[#084c91] disabled:opacity-50">
                创建手动联系人
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </div>
        )}

        {/* Help */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600 space-y-2">
          <h4 className="font-bold text-gray-800">LinkLoop 用户 vs 手动联系人</h4>
          <div className="flex items-start gap-2"><Tag color="blue">LL 用户</Tag><span>对方也使用 LinkLoop，信息由对方授权展示，自动同步更新</span></div>
          <div className="flex items-start gap-2"><Tag color="gray">手动</Tag><span>对方不是 LinkLoop 用户，你需要手动录入和维护关联账号信息</span></div>
        </div>
      </div>
    </div>
  );
}
