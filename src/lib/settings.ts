import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const SETTINGS_PATH = join(process.cwd(), "settings.json");

export interface AppSettings {
  ai: {
    provider: "deepseek" | "openai" | "zhipu" | "custom";
    apiKey: string;
    model: string;
    baseUrl: string;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    provider: "deepseek",
    apiKey: "",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.com/v1",
  },
};

const PROVIDER_PRESETS: Record<string, { baseUrl: string; defaultModel: string; name: string }> = {
  deepseek: { baseUrl: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat", name: "DeepSeek" },
  openai: { baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini", name: "OpenAI" },
  zhipu: { baseUrl: "https://open.bigmodel.cn/api/paas/v4", defaultModel: "glm-4-flash", name: "智谱 GLM" },
  custom: { baseUrl: "", defaultModel: "", name: "自定义" },
};

export function getProviderPresets() {
  return PROVIDER_PRESETS;
}

export function getSettings(): AppSettings {
  try {
    if (existsSync(SETTINGS_PATH)) {
      const raw = readFileSync(SETTINGS_PATH, "utf-8");
      const saved = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...saved, ai: { ...DEFAULT_SETTINGS.ai, ...saved.ai } };
    }
  } catch {
    // fall through
  }

  // Fallback: read from env
  const envKey = process.env.DEEPSEEK_API_KEY;
  if (envKey) {
    return {
      ...DEFAULT_SETTINGS,
      ai: { ...DEFAULT_SETTINGS.ai, apiKey: envKey },
    };
  }

  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const merged: AppSettings = {
    ...current,
    ai: { ...current.ai, ...(settings.ai || {}) },
  };
  writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

export function getAIConfig() {
  const settings = getSettings();
  const { provider, apiKey, model, baseUrl } = settings.ai;
  const preset = PROVIDER_PRESETS[provider];
  return {
    apiKey,
    model: model || preset?.defaultModel || "",
    baseUrl: baseUrl || preset?.baseUrl || "",
    provider: preset?.name || provider,
    configured: !!apiKey,
  };
}
