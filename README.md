# 领路 LinkLoop

为关键关系找到前进路径 —— 自动汇总邮件、日历、沟通记录和关注账号动态，帮你发现**谁在等你、你在等谁、关系发生了什么变化，以及下一步该做什么**。

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装和运行

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 填充示例数据
npm run db:seed

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可体验。

### AI 分析功能（可选）

在 `.env` 文件中配置 DeepSeek API Key 以启用完整 AI 分析能力：

```
DEEPSEEK_API_KEY=your-api-key-here
```

未配置时，AI 分析页面将使用基于关键词的简单匹配作为降级方案。

## 功能模块

| 模块 | 说明 |
|------|------|
| 今日行动中心 | 每日高优先级跟进事项和指标概览 |
| 信息收件箱 | 多来源信息汇总（邮件/日历/会议/聊天/社媒/文件） |
| 联系人管理 | 持久化关系档案，含健康度评分和互动时间线 |
| 谁在等我/我在等谁 | 双向承诺追踪 |
| 承诺清单 | 结构化承诺事项管理 |
| 关注账号动态 | 社媒动态监控和 AI 事件识别 |
| 周报 | 关系进展自动报告 |
| AI 分析 | 信息提取、关系分析、消息草稿生成 |
| 数据导入 | 粘贴文本 AI 提取 + CSV 批量导入 |

## 技术栈

- **前端**：Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **数据库**：SQLite via Prisma ORM
- **AI**：DeepSeek API（可选）
- **部署**：支持 Vercel / Docker / 本地运行

## 项目结构

```
src/
  app/           # Next.js 页面和 API 路由
  components/    # 共享 UI 组件
  lib/           # 数据库和 AI 工具函数
prisma/
  schema.prisma  # 数据模型
  seed.ts        # 示例数据
docs/
  demo/          # 静态 HTML Demo（初赛提交版）
  design/        # 产品设计文档
```

## Docker 部署

```bash
docker-compose up -d
```

## 静态 Demo

初赛提交的可离线运行 HTML Demo 位于 `docs/demo/linkloop_demo.html`，浏览器直接打开即可体验。

---

TRAE AI 创造力大赛 · 学习工作赛道
