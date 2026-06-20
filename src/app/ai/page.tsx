"use client";

import { useEffect, useState } from "react";

interface AIStatus {
  configured: boolean;
  model: string | null;
  provider: string | null;
  status: string;
  message: string;
  availableModels?: string[];
}

export default function AIPage() {
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [input, setInput] = useState(`邮件：王总说希望本周五前收到 AI 运维工具的本地部署方案，重点关注数据安全、权限隔离和部署成本。

日历：今天下午 3 点与陈工进行技术对接会议，主题是接口文档和测试环境。

历史记录：上周已向 Lily HR 发送面试补充材料，目前 7 天未收到反馈。

社媒动态：Alex 最近在 LinkedIn 发布观点，提到他正在关注企业 AI 工具的真实落地案例。

关系历史：Alex 上次沟通时希望看到产品 Demo 和真实试点反馈。`);
  const [output, setOutput] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ai/status").then(r => r.json()).then(setAiStatus).catch(() => {});
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setOutput([]);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setOutput(data.results || []);
    } catch {
      setOutput([{ tag: "错误", text: "AI 分析服务暂不可用，请检查 DeepSeek API 配置。" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI 分析演示</h1>
        <p className="text-gray-500 text-sm mt-1">模拟系统从多个信息源中提取信号，并生成行动建议和消息草稿</p>
      </div>

      {aiStatus && (
        <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
          aiStatus.status === "已连接"
            ? "bg-green-50 border-green-200 text-green-800"
            : aiStatus.status === "已配置"
              ? "bg-yellow-50 border-yellow-200 text-yellow-800"
              : aiStatus.status === "Key 无效"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-gray-50 border-gray-200 text-gray-600"
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            aiStatus.status === "已连接" ? "bg-green-500" : aiStatus.status === "已配置" ? "bg-yellow-500" : aiStatus.status === "Key 无效" ? "bg-red-500" : "bg-gray-400"
          }`} />
          <div className="flex-1">
            <span className="font-semibold">{aiStatus.message}</span>
            {aiStatus.availableModels && aiStatus.availableModels.length > 1 && (
              <span className="ml-2 text-xs opacity-70">
                可用模型：{aiStatus.availableModels.join(", ")}
              </span>
            )}
          </div>
          {aiStatus.model && (
            <span className="px-2.5 py-1 rounded-full bg-white/60 text-xs font-bold border border-current/10">
              {aiStatus.provider} / {aiStatus.model}
            </span>
          )}
          {!aiStatus.configured && (
            <span className="text-xs opacity-60">配置 .env → DEEPSEEK_API_KEY</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold mb-3">输入：自动汇总的信息</h3>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full min-h-[320px] border border-gray-200 rounded-lg p-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100 resize-y"
          />
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="mt-3 w-full bg-[var(--blue)] text-white rounded-lg py-2.5 font-bold text-sm hover:bg-[#084c91] disabled:opacity-50 transition-colors"
          >
            {loading ? "⏳ 分析中..." : "▶ 运行 AI 分析"}
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold mb-3">输出：今日行动中心</h3>
          {loading && (
            <div className="flex items-center gap-2 py-4 text-[var(--blue)] font-semibold text-sm">
              <div className="w-5 h-5 border-[3px] border-blue-100 border-t-[var(--blue)] rounded-full animate-spin" />
              AI 正在分析信息...
            </div>
          )}
          <div className="space-y-3">
            {output.map((r: any, i: number) => (
              <div key={i} className="border-b border-dashed border-gray-100 pb-3 last:border-b-0">
                <div className="text-xs font-bold text-[var(--blue)] mb-1">{r.tag}</div>
                <p className="text-sm text-gray-700">{r.text}</p>
              </div>
            ))}
          </div>
          {!loading && output.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">点击左侧按钮运行 AI 分析</div>
          )}
        </div>
      </div>
    </div>
  );
}
