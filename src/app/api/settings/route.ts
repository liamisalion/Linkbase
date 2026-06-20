import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings, getProviderPresets } from "@/lib/settings";

export async function GET() {
  const settings = getSettings();
  const presets = getProviderPresets();

  // Mask the API key for security
  const masked = settings.ai.apiKey
    ? settings.ai.apiKey.slice(0, 6) + "****" + settings.ai.apiKey.slice(-4)
    : "";

  return NextResponse.json({
    ai: { ...settings.ai, apiKey: masked, hasKey: !!settings.ai.apiKey },
    presets,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const updated = saveSettings({ ai: body.ai });

  const masked = updated.ai.apiKey
    ? updated.ai.apiKey.slice(0, 6) + "****" + updated.ai.apiKey.slice(-4)
    : "";

  return NextResponse.json({
    ai: { ...updated.ai, apiKey: masked, hasKey: !!updated.ai.apiKey },
    message: "设置已保存",
  });
}
