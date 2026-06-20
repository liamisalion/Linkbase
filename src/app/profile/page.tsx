"use client";

import { useEffect, useState } from "react";

const PLATFORMS = [
  { key: "emails", label: "邮箱", icon: "📧", placeholder: "多个邮箱用逗号分隔", isArray: true },
  { key: "phones", label: "手机", icon: "📱", placeholder: "手机号码", isArray: true },
  { key: "wechat", label: "微信", icon: "💬", placeholder: "微信号" },
  { key: "linkedin", label: "LinkedIn", icon: "💼", placeholder: "LinkedIn 用户名或链接" },
  { key: "twitter", label: "X / Twitter", icon: "🐦", placeholder: "@用户名" },
  { key: "github", label: "GitHub", icon: "🐙", placeholder: "GitHub 用户名" },
  { key: "maimai", label: "脉脉", icon: "👔", placeholder: "脉脉昵称" },
  { key: "feishu", label: "飞书", icon: "🕊️", placeholder: "飞书 ID" },
  { key: "dingtalk", label: "钉钉", icon: "📌", placeholder: "钉钉号" },
  { key: "website", label: "个人网站", icon: "🌐", placeholder: "https://..." },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "所有人", desc: "所有 LinkLoop 用户可见" },
  { value: "linked", label: "已 Link", desc: "已 Link 我的人可见" },
  { value: "tagged", label: "特定标签", desc: "仅特定标签的联系人可见" },
  { value: "private", label: "私密", desc: "不对任何人展示" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [rules, setRules] = useState<Record<string, { level: string; allowTags: string[] }>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(data => {
      const p = data.profile || {};
      if (typeof p.emails === "string") try { p.emails = JSON.parse(p.emails); } catch { p.emails = []; }
      if (typeof p.phones === "string") try { p.phones = JSON.parse(p.phones); } catch { p.phones = []; }
      setProfile(p);

      const rMap: Record<string, { level: string; allowTags: string[] }> = {};
      for (const r of (data.rules || [])) {
        let tags: string[] = [];
        try { tags = JSON.parse(r.allowTags); } catch {}
        rMap[r.field] = { level: r.level, allowTags: tags };
      }
      setRules(rMap);
    });
  }, []);

  function updateField(key: string, value: any) {
    setProfile((prev: any) => ({ ...prev, [key]: value }));
  }

  function updateVisibility(field: string, level: string) {
    setRules(prev => ({ ...prev, [field]: { ...prev[field], level, allowTags: prev[field]?.allowTags || [] } }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const rulesList = Object.entries(rules).map(([field, r]) => ({
        field,
        level: r.level,
        allowTags: r.allowTags || [],
      }));
      await fetch("/api/profile/visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: rulesList }),
      });

      setMessage({ type: "success", text: "名片和可见性规则已保存" });
    } catch {
      setMessage({ type: "error", text: "保存失败" });
    } finally {
      setSaving(false);
    }
  }

  const getVisibility = (field: string) => rules[field]?.level || "linked";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的 LinkLoop 名片</h1>
        <p className="text-gray-500 text-sm mt-1">设置你的信息和每个字段的可见级别，控制其他用户 link 你时能看到什么</p>
      </div>

      <div className="max-w-3xl space-y-5">
        {/* Basic info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-4">基本信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">显示名称</label>
              <input value={profile.displayName || ""} onChange={e => updateField("displayName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">公司</label>
              <input value={profile.company || ""} onChange={e => updateField("company", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">职位</label>
              <input value={profile.title || ""} onChange={e => updateField("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 mb-1">简介</label>
              <input value={profile.bio || ""} onChange={e => updateField("bio", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]" />
            </div>
          </div>
        </div>

        {/* Social accounts with visibility */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-1">联系方式和社媒账号</h3>
          <p className="text-sm text-gray-400 mb-4">每个字段右侧可设置可见级别</p>
          <div className="space-y-4">
            {PLATFORMS.map(p => (
              <div key={p.key} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center shrink-0">{p.icon}</span>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{p.label}</label>
                  <input
                    value={p.isArray ? (Array.isArray(profile[p.key]) ? profile[p.key].join(", ") : "") : (profile[p.key] || "")}
                    onChange={e => updateField(p.key, p.isArray ? e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) : e.target.value)}
                    placeholder={p.placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]"
                  />
                </div>
                <div className="shrink-0 w-32">
                  <select
                    value={getVisibility(p.key)}
                    onChange={e => updateVisibility(p.key, e.target.value)}
                    className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none focus:border-[var(--blue)]"
                  >
                    {VISIBILITY_OPTIONS.map(v => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visibility legend */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h4 className="font-bold text-sm mb-3">可见级别说明</h4>
          <div className="grid grid-cols-2 gap-3">
            {VISIBILITY_OPTIONS.map(v => (
              <div key={v.value} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  v.value === "public" ? "bg-green-400" : v.value === "linked" ? "bg-blue-400" : v.value === "tagged" ? "bg-yellow-400" : "bg-gray-400"
                }`} />
                <div>
                  <span className="font-semibold">{v.label}</span>
                  <span className="text-gray-500 ml-1">- {v.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </div>
        )}

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-[var(--blue)] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#084c91] disabled:opacity-50 transition-colors">
          {saving ? "保存中..." : "保存名片和可见性设置"}
        </button>
      </div>
    </div>
  );
}
