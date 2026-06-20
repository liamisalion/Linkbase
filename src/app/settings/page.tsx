"use client";

import { useEffect, useState } from "react";

interface Preset {
  baseUrl: string;
  defaultModel: string;
  name: string;
}

export default function SettingsPage() {
  const [provider, setProvider] = useState("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com/v1");
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setProvider(data.ai.provider);
        setModel(data.ai.model);
        setBaseUrl(data.ai.baseUrl);
        setHasExistingKey(data.ai.hasKey);
        setPresets(data.presets || {});
      });
  }, []);

  function onProviderChange(p: string) {
    setProvider(p);
    const preset = presets[p];
    if (preset) {
      setBaseUrl(preset.baseUrl);
      setModel(preset.defaultModel);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = { provider, model, baseUrl };
      if (apiKey) body.apiKey = apiKey;
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai: body }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "设置已保存" });
        setHasExistingKey(data.ai.hasKey);
        setApiKey("");
      } else {
        setMessage({ type: "error", text: data.error || "保存失败" });
      }
    } catch {
      setMessage({ type: "error", text: "保存失败，请重试" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setMessage(null);
    try {
      const res = await fetch("/api/ai/status");
      const data = await res.json();
      setTestResult(data);
      if (data.status === "已连接") {
        setMessage({ type: "success", text: data.message });
      } else if (data.status === "Key 无效") {
        setMessage({ type: "error", text: data.message });
      } else if (data.status === "未配置") {
        setMessage({ type: "info", text: "请先保存 API Key 再测试连接" });
      } else {
        setMessage({ type: "info", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "连接测试失败" });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI 设置</h1>
        <p className="text-gray-500 text-sm mt-1">配置 AI 模型提供商和 API Key，启用智能分析能力</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Provider Selection */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-4">模型提供商</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => onProviderChange(key)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  provider === key
                    ? "border-[var(--blue)] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">
                  {key === "deepseek" ? "🐋" : key === "openai" ? "🤖" : key === "zhipu" ? "🧠" : "⚙️"}
                </div>
                <div className="text-sm font-semibold">{preset.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold mb-1">API Key</h3>
          <p className="text-sm text-gray-500 mb-4">
            {provider === "deepseek" && "前往 platform.deepseek.com 获取 API Key"}
            {provider === "openai" && "前往 platform.openai.com 获取 API Key"}
            {provider === "zhipu" && "前往 open.bigmodel.cn 获取 API Key"}
            {provider === "custom" && "填入兼容 OpenAI 格式的 API Key"}
          </p>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasExistingKey ? "已配置（输入新 Key 可覆盖）" : "sk-xxxxxxxxxxxxxxxx"}
              className="w-full px-4 py-2.5 pr-20 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100"
            />
            {hasExistingKey && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                已配置
              </span>
            )}
          </div>
        </div>

        {/* Model & URL */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">模型名称</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">API 地址</label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          {testResult?.availableModels && testResult.availableModels.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">可用模型（点击切换）</label>
              <div className="flex gap-1.5 flex-wrap">
                {testResult.availableModels.map((m: string) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      model === m
                        ? "bg-[var(--blue)] text-white border-[var(--blue)]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[var(--blue)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-[var(--blue)] border border-blue-200"
          }`}>
            <span>{message.type === "success" ? "✓" : message.type === "error" ? "✗" : "ℹ"}</span>
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[var(--blue)] text-white rounded-xl py-3 font-bold text-sm hover:bg-[#084c91] disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存设置"}
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-6 border-2 border-[var(--blue)] text-[var(--blue)] rounded-xl py-3 font-bold text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {testing ? "测试中..." : "测试连接"}
          </button>
        </div>

        {/* Help */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600 space-y-2">
          <h4 className="font-bold text-gray-800">使用说明</h4>
          <p>1. 选择模型提供商（推荐 DeepSeek，价格低且国内可用）</p>
          <p>2. 填入对应平台的 API Key</p>
          <p>3. 点击"保存设置"，然后"测试连接"验证是否成功</p>
          <p>4. 连接成功后，AI 分析、消息草稿、数据导入等功能将使用真实 AI</p>
          <p className="text-gray-400 text-xs mt-3">API Key 仅保存在本地服务器，不会上传到任何第三方服务。</p>
        </div>
      </div>
    </div>
  );
}
