import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { analyzeInformation } from "@/lib/ai";

function parseEml(content: string) {
  const headers: Record<string, string> = {};
  const parts = content.split(/\r?\n\r?\n/);
  const headerBlock = parts[0] || "";
  const body = parts.slice(1).join("\n\n").trim();
  
  for (const line of headerBlock.split(/\r?\n/)) {
    const match = line.match(/^(From|To|Subject|Date|Cc):\s*(.+)/i);
    if (match) {
      headers[match[1].toLowerCase()] = match[2].trim();
    }
  }
  
  const extractName = (s: string) => {
    const m = s.match(/^"?([^"<]+)"?\s*</);
    return m ? m[1].trim() : s.replace(/<[^>]+>/, "").trim();
  };
  
  return {
    from: headers.from || "",
    fromName: headers.from ? extractName(headers.from) : "",
    to: headers.to || "",
    toName: headers.to ? extractName(headers.to) : "",
    subject: headers.subject || "(无主题)",
    date: headers.date || "",
    body: body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000),
    cc: headers.cc || "",
  };
}

function parseWechatTxt(content: string) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  const names = new Set<string>();
  const messages: string[] = [];
  
  for (const line of lines) {
    const match = line.match(/^\d{4}[-/]\d{2}[-/]\d{2}\s+\d{2}:\d{2}(?::\d{2})?\s+(.+)/);
    if (match) {
      names.add(match[1].trim());
    }
    messages.push(line);
  }
  
  return {
    participants: Array.from(names),
    content: messages.join("\n").slice(0, 3000),
    messageCount: lines.length,
  };
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { name: "Demo用户", email: "demo@linkloop.app" },
    });
  }

  // Handle file upload (multipart/form-data)
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
    }
    
    const fileName = file.name.toLowerCase();
    const fileContent = await file.text();
    
    // .eml file
    if (fileName.endsWith(".eml")) {
      const parsed = parseEml(fileContent);
      const summary = `发件人: ${parsed.from}\n收件人: ${parsed.to}\n主题: ${parsed.subject}\n日期: ${parsed.date}\n\n${parsed.body}`;
      
      let matchedContact = null;
      if (parsed.fromName) {
        matchedContact = await prisma.contact.findFirst({
          where: { name: { contains: parsed.fromName } },
        });
      }
      
      const inboxItem = await prisma.inboxItem.create({
        data: {
          contactId: matchedContact?.id || null,
          source: "邮件",
          title: `${parsed.fromName || parsed.from}: ${parsed.subject}`,
          preview: parsed.body.slice(0, 200),
          tags: JSON.stringify([parsed.fromName, parsed.subject].filter(Boolean)),
          time: parsed.date || "导入",
        },
      });
      
      if (matchedContact) {
        await prisma.interaction.create({
          data: {
            contactId: matchedContact.id,
            channel: "邮件",
            summary: `主题: ${parsed.subject}\n${parsed.body.slice(0, 300)}`,
            date: parsed.date ? new Date(parsed.date) : new Date(),
          },
        });
        await prisma.contact.update({
          where: { id: matchedContact.id },
          data: { lastContactAt: new Date(), health: Math.min(100, matchedContact.health + 3) },
        });
      }
      
      let aiResults: any[] = [];
      try { aiResults = await analyzeInformation(summary); } catch {}
      
      return NextResponse.json({
        message: `邮件已导入: ${parsed.subject}`,
        fileType: "eml",
        parsed: { from: parsed.fromName || parsed.from, subject: parsed.subject, date: parsed.date },
        matchedContact: matchedContact ? { id: matchedContact.id, name: matchedContact.name } : null,
        inboxItem,
        aiResults,
      });
    }
    
    // .txt file (chat records)
    if (fileName.endsWith(".txt")) {
      const parsed = parseWechatTxt(fileContent);
      
      const matchedContacts = [];
      for (const name of parsed.participants) {
        const contact = await prisma.contact.findFirst({
          where: { name: { contains: name } },
        });
        if (contact) matchedContacts.push(contact);
      }
      
      const inboxItem = await prisma.inboxItem.create({
        data: {
          contactId: matchedContacts[0]?.id || null,
          source: "聊天",
          title: `聊天记录导入: ${parsed.participants.slice(0, 3).join(", ") || file.name}`,
          preview: parsed.content.slice(0, 200),
          tags: JSON.stringify(parsed.participants.slice(0, 5)),
          time: "导入",
        },
      });
      
      let aiResults: any[] = [];
      try { aiResults = await analyzeInformation(parsed.content); } catch {}
      
      return NextResponse.json({
        message: `聊天记录已导入 (${parsed.messageCount} 条消息)`,
        fileType: "txt",
        parsed: { participants: parsed.participants, messageCount: parsed.messageCount },
        matchedContacts: matchedContacts.map(c => ({ id: c.id, name: c.name })),
        inboxItem,
        aiResults,
      });
    }
    
    // .csv file upload
    if (fileName.endsWith(".csv")) {
      const lines = fileContent.trim().split(/\r?\n/);
      if (lines.length < 2) {
        return NextResponse.json({ error: "CSV 文件为空" }, { status: 400 });
      }
      const headers = lines[0].split(",").map(h => h.trim());
      const created = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          const key = h === "姓名" || h === "name" ? "name" 
            : h === "公司" || h === "company" ? "company"
            : h === "职位" || h === "title" ? "title"
            : h === "类型" || h === "type" ? "type" : h;
          row[key] = vals[idx] || "";
        });
        if (!row.name?.trim()) continue;
        const contact = await prisma.contact.create({
          data: {
            userId: user.id,
            name: row.name.trim(),
            company: row.company?.trim() || "",
            title: row.title?.trim() || "",
            type: row.type?.trim() || "其他",
            avatar: row.name.trim()[0],
            interests: "[]",
          },
        });
        created.push(contact);
      }
      return NextResponse.json({
        created: created.length,
        contacts: created,
        message: `成功导入 ${created.length} 个联系人`,
      });
    }
    
    return NextResponse.json({ error: `不支持的文件格式: ${fileName}` }, { status: 400 });
  }

  // Handle JSON body (existing text/csv import)
  const body = await req.json();
  const { type, data } = body;

  if (type === "text") {
    const text = data as string;
    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const inboxItem = await prisma.inboxItem.create({
      data: {
        source: "手动导入",
        title: "导入的文本信息",
        preview: text.slice(0, 200),
        tags: "[]",
        time: "刚刚",
      },
    });

    let aiResults: { tag: string; text: string }[] = [];
    try {
      aiResults = await analyzeInformation(text);
    } catch {
      // AI not available
    }

    return NextResponse.json({
      inboxItem,
      aiResults,
      message: "文本已导入并分析",
    });
  }

  if (type === "csv") {
    const rows = data as { name: string; company?: string; title?: string; type?: string }[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "CSV data is empty" }, { status: 400 });
    }

    const created = [];
    for (const row of rows) {
      if (!row.name?.trim()) continue;
      const contact = await prisma.contact.create({
        data: {
          userId: user.id,
          name: row.name.trim(),
          company: row.company?.trim() || "",
          title: row.title?.trim() || "",
          type: row.type?.trim() || "其他",
          avatar: row.name.trim()[0],
          interests: "[]",
        },
      });
      created.push(contact);
    }

    return NextResponse.json({
      created: created.length,
      contacts: created,
      message: `成功导入 ${created.length} 个联系人`,
    });
  }

  return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
}
