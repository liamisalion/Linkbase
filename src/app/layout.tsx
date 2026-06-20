import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export const metadata: Metadata = {
  title: "领路 LinkLoop",
  description: "为关键关系找到前进路径 - 自动汇总邮件、日历、沟通记录和关注账号动态",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Topbar />
        <div className="flex pt-14">
          <Sidebar />
          <main className="flex-1 ml-56 min-h-[calc(100vh-56px)]">
            <div className="p-5 max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
