import { getAIConfig } from "@/lib/settings";

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const config = getAIConfig();
  if (!config.apiKey) {
    throw new Error("AI API Key not configured");
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${config.provider} API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function analyzeInformation(text: string) {
  const systemPrompt = `你是 领路 LinkLoop的 AI 分析引擎。用户会输入多条来自邮件、日历、聊天记录和社媒动态的信息。
请分析这些信息，输出一个 JSON 数组，每个元素包含 tag 和 text 字段。

分析维度：
1. 谁在等我（对方正在等待用户处理的事项）
2. 我在等谁（用户已发出但对方未反馈的事项）
3. 社媒触发（公开动态引发的联系时机）
4. 会前简报（即将到来的会议准备建议）
5. 关系分析（联系人关系阶段变化）
6. 消息草稿（针对需要跟进的联系人生成消息草稿）
7. 机会识别（可能的商业或合作机会）
8. 不打扰判断（哪些联系人现在不适合联系）

只输出 JSON 数组，不要输出其他内容。示例格式：
[{"tag":"🔴 谁在等我","text":"分析内容"},{"tag":"✉️ 消息草稿","text":"草稿内容"}]`;

  try {
    const result = await callAI(systemPrompt, text);
    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return getFallbackAnalysis(text);
  }
}

export async function analyzeRelationship(
  contactName: string,
  interactions: { channel: string; summary: string; date: string }[]
) {
  const systemPrompt = `你是 领路 LinkLoop的 AI 关系分析引擎。根据联系人的互动历史，输出 JSON 对象包含以下字段：
- stage: 关系阶段描述
- interest: 对方关注点排序
- rhythm: 建议跟进节奏
- opportunity: 当前机会
- risk: 风险提醒
只输出 JSON 对象。`;

  const userPrompt = `联系人：${contactName}\n互动历史：\n${interactions
    .map((i) => `[${i.date}] ${i.channel}：${i.summary}`)
    .join("\n")}`;

  try {
    const result = await callAI(systemPrompt, userPrompt);
    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      stage: "分析暂不可用",
      interest: "待 AI 分析",
      rhythm: "待 AI 分析",
      opportunity: "待 AI 分析",
      risk: "待 AI 分析",
    };
  }
}

export async function generateDraft(
  contactName: string,
  scenario: string,
  context: string
) {
  const systemPrompt = `你是 领路 LinkLoop的消息草稿生成引擎。根据联系人上下文和场景，生成一封专业、得体的跟进消息。
直接输出消息内容，不要加任何额外说明。消息应该简洁、自然，不要过于正式。`;

  const userPrompt = `联系人：${contactName}\n场景：${scenario}\n上下文：${context}`;

  try {
    return await callAI(systemPrompt, userPrompt);
  } catch {
    return `${contactName} 你好，[消息草稿生成需要配置 AI API Key]`;
  }
}

function getFallbackAnalysis(text: string) {
  const results = [];

  if (text.includes("本周") || text.includes("截止") || text.includes("等待") || text.includes("方案")) {
    results.push({ tag: "🔴 谁在等我", text: "检测到包含截止时间或等待回复的信息，建议尽快处理。" });
  }
  if (text.includes("未回复") || text.includes("未收到") || text.includes("天未")) {
    results.push({ tag: "🟡 我在等谁", text: "检测到有等待对方反馈的事项，建议在合适时间发送礼貌询问。" });
  }
  if (text.includes("LinkedIn") || text.includes("动态") || text.includes("发布")) {
    results.push({ tag: "🟡 社媒触发", text: "检测到社媒动态信号，可能是自然联系的好时机。" });
  }
  if (text.includes("会议") || text.includes("下午") || text.includes("对接")) {
    results.push({ tag: "🟢 会前简报", text: "检测到会议安排，建议提前准备相关材料和问题清单。" });
  }
  if (results.length === 0) {
    results.push({ tag: "ℹ️ 提示", text: "请在设置页面配置 AI API Key 以启用完整分析能力。当前使用基于关键词的简单匹配。" });
  }
  results.push({ tag: "🟣 持久化分析", text: "基于输入信息的初步分析。配置 AI API 后可获得更精准的关系阶段判断和行动建议。" });

  return results;
}
