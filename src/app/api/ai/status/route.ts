import { NextResponse } from "next/server";
import { getAIConfig } from "@/lib/settings";

export async function GET() {
  const config = getAIConfig();

  if (!config.configured) {
    return NextResponse.json({
      configured: false,
      model: null,
      provider: null,
      status: "未配置",
      message: "请在设置页面配置 AI API Key",
    });
  }

  try {
    const res = await fetch(`${config.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const models = (data.data || []).map((m: { id: string }) => m.id);

      return NextResponse.json({
        configured: true,
        model: config.model,
        provider: config.provider,
        status: "已连接",
        availableModels: models,
        message: `已连接 ${config.provider}，当前使用 ${config.model}`,
      });
    }

    if (res.status === 401) {
      return NextResponse.json({
        configured: true,
        model: config.model,
        provider: config.provider,
        status: "Key 无效",
        message: "API Key 验证失败，请在设置中检查",
      });
    }

    return NextResponse.json({
      configured: true,
      model: config.model,
      provider: config.provider,
      status: "已配置",
      message: `已配置 ${config.provider} / ${config.model}`,
    });
  } catch {
    return NextResponse.json({
      configured: true,
      model: config.model,
      provider: config.provider,
      status: "已配置",
      message: `已配置 ${config.provider} / ${config.model}，但无法连接服务`,
    });
  }
}
