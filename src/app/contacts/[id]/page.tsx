"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HealthBar } from "@/components/HealthBar";
import { Tag } from "@/components/Tag";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editLinks, setEditLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/contacts/${id}`).then(r => r.json()).then(d => { setContact(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="animate-pulse text-gray-400 py-12 text-center">加载中...</div>;
  if (!contact) return <div className="text-center py-12 text-gray-400">联系人不存在</div>;

  const interests: string[] = (() => { try { return JSON.parse(contact.interests); } catch { return []; } })();

  async function saveLinks() {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editLinks),
    });
    setContact((prev: any) => ({ ...prev, ...editLinks }));
    setEditing(false);
  }
  const analysis = contact.analyses?.[0] ? (() => { try { return JSON.parse(contact.analyses[0].result); } catch { return null; } })() : null;

  return (
    <div>
      <button onClick={() => router.push("/contacts")} className="text-gray-500 hover:text-[var(--blue)] text-sm font-semibold mb-4 inline-flex items-center gap-1">
        ← 返回联系人列表
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex gap-4 items-start p-6 border-b border-gray-200">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center font-bold text-xl">
            {contact.avatar || contact.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold">{contact.name}</h2>
            <div className="text-sm text-gray-500">{contact.company} · {contact.title}</div>
            <div className="flex gap-1.5 mt-2">
              <Tag color="blue">{contact.type}</Tag>
              <Tag color="green">{contact.stage}</Tag>
              {contact.isLinkedUser ? (
                <Tag color="blue">LL 用户</Tag>
              ) : (
                <Tag color="gray">手动</Tag>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 p-5 border-b border-gray-200">
          <div className="text-center">
            <div className="text-xl font-extrabold text-[var(--blue)]">{contact.interactions?.length || 0}</div>
            <div className="text-xs text-gray-500">互动次数</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-[var(--blue)]">{interests.length}</div>
            <div className="text-xs text-gray-500">关注点</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-[var(--blue)]">{contact.lastContactAt ? new Date(contact.lastContactAt).toLocaleDateString("zh-CN") : "无"}</div>
            <div className="text-xs text-gray-500">最近联系</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-extrabold text-[var(--blue)]">{contact.frequency}</div>
            <div className="text-xs text-gray-500">建议频率</div>
          </div>
        </div>

        {/* Health */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">关系健康度</span>
          </div>
          <HealthBar score={contact.health} />
        </div>

        {/* Timeline */}
        <div className="p-6">
          <h3 className="font-bold mb-4">互动时间线</h3>
          <div className="border-l-2 border-gray-200 ml-1.5 pl-5 space-y-5">
            {(contact.interactions || []).map((t: any) => (
              <div key={t.id} className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[var(--blue)] border-2 border-white shadow-sm" />
                <div className="text-xs text-gray-400 mb-0.5">{new Date(t.date).toLocaleDateString("zh-CN")} · {t.channel}</div>
                <p className="text-sm text-gray-600">{t.summary}</p>
              </div>
            ))}
            {(!contact.interactions || contact.interactions.length === 0) && (
              <div className="text-sm text-gray-400">暂无互动记录</div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-bold mb-4">🤖 AI 持久化分析</h3>
            <div className="space-y-3">
              {Object.entries(analysis).map(([key, val]) => (
                <div key={key} className="flex gap-3 text-sm border-b border-dashed border-gray-100 pb-3 last:border-b-0">
                  <strong className="text-gray-500 min-w-[80px] shrink-0">{key}</strong>
                  <span className="text-gray-700">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-bold mb-3">🏷️ 关注点标签</h3>
            <div className="flex gap-1.5 flex-wrap">
              {interests.map((i) => <Tag key={i} color="blue">{i}</Tag>)}
            </div>
          </div>
        )}

        {/* Linked accounts */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">🔗 关联账号</h3>
            {contact.isLinkedUser ? (
              <span className="text-xs bg-blue-50 text-[var(--blue)] px-2.5 py-1 rounded-full font-bold">LL 用户 · 由对方授权</span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-bold">手动联系人</span>
            )}
          </div>
          {contact.isLinkedUser ? (
            <div className="text-sm text-gray-500 bg-blue-50 rounded-lg p-3">该联系人是 LinkLoop 用户，信息由对方授权展示并自动同步。</div>
          ) : (
            <div className="space-y-2.5">
              {[
                { key: "email", icon: "📧", label: "邮箱" },
                { key: "phone", icon: "📱", label: "手机" },
                { key: "wechat", icon: "💬", label: "微信" },
                { key: "linkedin", icon: "💼", label: "LinkedIn" },
                { key: "twitter", icon: "🐦", label: "X / Twitter" },
                { key: "github", icon: "🐙", label: "GitHub" },
              ].map(p => (
                <div key={p.key} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-center">{p.icon}</span>
                  <span className="text-gray-500 w-16 shrink-0">{p.label}</span>
                  {editing ? (
                    <input
                      value={editLinks[p.key] || ""}
                      onChange={e => setEditLinks(prev => ({ ...prev, [p.key]: e.target.value }))}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]"
                      placeholder={`输入${p.label}`}
                    />
                  ) : (
                    <span className={contact[p.key] ? "text-gray-800" : "text-gray-300"}>
                      {contact[p.key] || "未设置"}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                {editing ? (
                  <>
                    <button onClick={saveLinks} className="px-4 py-1.5 bg-[var(--blue)] text-white rounded-lg text-sm font-semibold">保存</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-gray-500 text-sm">取消</button>
                  </>
                ) : (
                  <button onClick={() => { setEditing(true); setEditLinks({ email: contact.email, phone: contact.phone, wechat: contact.wechat, linkedin: contact.linkedin, twitter: contact.twitter, github: contact.github }); }}
                    className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50">
                    编辑关联账号
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Commitments */}
        {contact.commitments?.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-bold mb-3">📋 相关承诺</h3>
            <div className="space-y-2">
              {contact.commitments.map((cm: any) => (
                <div key={cm.id} className="flex items-center gap-2 text-sm p-2.5 bg-gray-50 rounded-lg">
                  <span>{cm.status === "overdue" ? "⚠️" : cm.status === "done" ? "✅" : "🔶"}</span>
                  <Tag color={cm.direction === "mine" ? "blue" : "purple"}>{cm.direction === "mine" ? "我方" : "对方"}</Tag>
                  <span className="flex-1">{cm.what}</span>
                  <span className="text-xs text-gray-400">{cm.deadline}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
