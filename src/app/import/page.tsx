"use client";

import { useCallback, useRef, useState } from "react";

export default function ImportPage() {
  const [tab, setTab] = useState<"text" | "csv" | "file">("file");
  const [text, setText] = useState("");
  const [csvText, setCsvText] = useState("姓名,公司,职位,类型\n");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleTextImport() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", data: text }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "导入失败" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCsvImport() {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        const key = h === "姓名" ? "name" : h === "公司" ? "company" : h === "职位" ? "title" : h === "类型" ? "type" : h;
        row[key] = vals[i] || "";
      });
      return row;
    });
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "csv", data: rows }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "导入失败" });
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setSelectedFile(file);
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      setResult(await res.json());
    } catch {
      setResult({ error: "文件上传失败" });
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  const fileIcon = (name: string) => {
    if (name.endsWith(".eml")) return "📧";
    if (name.endsWith(".txt")) return "💬";
    if (name.endsWith(".csv")) return "📊";
    return "📄";
  };

  const fileDesc = (name: string) => {
    if (name.endsWith(".eml")) return "邮件文件";
    if (name.endsWith(".txt")) return "聊天记录";
    if (name.endsWith(".csv")) return "联系人表格";
    return "文件";
  };

  const tabs = [
    { id: "file" as const, label: "📁 文件上传", desc: ".eml / .txt / .csv" },
    { id: "text" as const, label: "📝 粘贴文本", desc: "邮件/聊天记录" },
    { id: "csv" as const, label: "📊 CSV 编辑", desc: "手动输入" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">数据导入</h1>
        <p className="text-gray-500 text-sm mt-1">
          上传文件、粘贴文本或编辑 CSV，AI 自动提取联系人、事件和承诺
        </p>
      </div>

      <div className="flex gap-1.5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null); setSelectedFile(null); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              tab === t.id ? "bg-[var(--blue)] text-white border-[var(--blue)]" : "bg-white text-gray-500 border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          {tab === "file" && (
            <>
              <h3 className="font-bold mb-3">拖拽或选择文件</h3>
              <p className="text-sm text-gray-500 mb-3">
                支持 .eml（邮件）、.txt（聊天记录）、.csv（联系人表格）
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-[var(--blue)] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {selectedFile ? (
                  <div>
                    <div className="text-4xl mb-3">{fileIcon(selectedFile.name)}</div>
                    <div className="font-bold text-sm">{selectedFile.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {fileDesc(selectedFile.name)} · {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">📂</div>
                    <div className="font-semibold text-sm text-gray-600">
                      拖拽文件到这里，或点击选择
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      .eml 邮件 · .txt 聊天记录 · .csv 联系人
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".eml,.txt,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              {selectedFile && (
                <button
                  onClick={() => { setSelectedFile(null); setResult(null); }}
                  className="mt-3 w-full text-gray-500 text-sm hover:text-gray-700"
                >
                  清除并重新选择
                </button>
              )}
            </>
          )}

          {tab === "text" && (
            <>
              <h3 className="font-bold mb-3">粘贴邮件 / 聊天记录 / 会议纪要</h3>
              <p className="text-sm text-gray-500 mb-3">
                粘贴原始文本，AI 会自动提取联系人、事件、承诺和时间节点
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"将邮件、聊天记录或会议纪要粘贴到这里...\n\n示例：\n王总发邮件说希望本周五前收到本地部署方案..."}
                className="w-full min-h-[300px] border border-gray-200 rounded-lg p-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100 resize-y"
              />
              <button
                onClick={handleTextImport}
                disabled={loading || !text.trim()}
                className="mt-3 w-full bg-[var(--blue)] text-white rounded-lg py-2.5 font-bold text-sm hover:bg-[#084c91] disabled:opacity-50 transition-colors"
              >
                {loading ? "⏳ 导入并分析中..." : "📥 导入并 AI 分析"}
              </button>
            </>
          )}

          {tab === "csv" && (
            <>
              <h3 className="font-bold mb-3">CSV 格式批量导入联系人</h3>
              <p className="text-sm text-gray-500 mb-3">
                第一行为表头（姓名,公司,职位,类型），每行一个联系人
              </p>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full min-h-[300px] border border-gray-200 rounded-lg p-3.5 text-sm bg-gray-50 focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-blue-100 resize-y font-mono"
              />
              <button
                onClick={handleCsvImport}
                disabled={loading}
                className="mt-3 w-full bg-[var(--blue)] text-white rounded-lg py-2.5 font-bold text-sm hover:bg-[#084c91] disabled:opacity-50 transition-colors"
              >
                {loading ? "⏳ 导入中..." : "📥 批量导入联系人"}
              </button>
            </>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold mb-3">导入结果</h3>
          {loading && (
            <div className="flex items-center gap-2 py-4 text-[var(--blue)] font-semibold text-sm">
              <div className="w-5 h-5 border-[3px] border-blue-100 border-t-[var(--blue)] rounded-full animate-spin" />
              处理中...
            </div>
          )}
          {result && !loading && (
            <div className="space-y-3">
              {result.message && (
                <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm font-semibold">
                  ✓ {result.message}
                </div>
              )}
              {result.error && (
                <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm font-semibold">
                  ✗ {result.error}
                </div>
              )}

              {/* File parse details */}
              {result.parsed && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <div className="font-semibold text-gray-700 mb-1.5">解析结果</div>
                  {result.parsed.from && <div><span className="text-gray-400">发件人：</span>{result.parsed.from}</div>}
                  {result.parsed.subject && <div><span className="text-gray-400">主题：</span>{result.parsed.subject}</div>}
                  {result.parsed.date && <div><span className="text-gray-400">日期：</span>{result.parsed.date}</div>}
                  {result.parsed.participants && (
                    <div><span className="text-gray-400">参与者：</span>{result.parsed.participants.join(", ")}</div>
                  )}
                  {result.parsed.messageCount && (
                    <div><span className="text-gray-400">消息数：</span>{result.parsed.messageCount} 条</div>
                  )}
                </div>
              )}

              {/* Matched contacts */}
              {result.matchedContact && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <span className="font-semibold text-[var(--blue)]">✓ 已匹配联系人：</span>
                  {result.matchedContact.name}
                </div>
              )}
              {result.matchedContacts?.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <span className="font-semibold text-[var(--blue)]">✓ 已匹配联系人：</span>
                  {result.matchedContacts.map((c: any) => c.name).join(", ")}
                </div>
              )}

              {/* AI results */}
              {result.aiResults?.map((r: any, i: number) => (
                <div key={i} className="border-b border-dashed border-gray-100 pb-3 last:border-b-0">
                  <div className="text-xs font-bold text-[var(--blue)] mb-1">{r.tag}</div>
                  <p className="text-sm text-gray-700">{r.text}</p>
                </div>
              ))}

              {/* CSV created contacts */}
              {result.created != null && (
                <div className="text-sm text-gray-600">
                  已创建 {result.created} 个联系人
                  {result.contacts?.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="w-7 h-7 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center text-xs font-bold">
                        {c.avatar}
                      </span>
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-gray-400 text-xs">{c.company} · {c.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!result && !loading && (
            <div className="text-center py-16 text-gray-400 text-sm">
              导入数据后结果将显示在这里
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
