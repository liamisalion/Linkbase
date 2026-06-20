const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.aIAnalysis.deleteMany();
  await prisma.socialFeed.deleteMany();
  await prisma.inboxItem.deleteMany();
  await prisma.commitment.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const user = await prisma.user.create({
    data: {
      name: "Demo用户",
      email: "demo@linkbase.app",
    },
  });

  // Create contacts
  const wang = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "王总",
      company: "XX制造",
      title: "IT负责人",
      type: "客户",
      avatar: "王",
      stage: "方案评估",
      health: 72,
      frequency: "每周",
      interests: JSON.stringify(["数据安全", "本地部署", "权限隔离", "部署成本"]),
      notes: "客户连续两次提到本地部署，说明需求明确",
      lastContactAt: new Date("2026-06-18"),
    },
  });

  const alex = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "Alex",
      company: "某VC",
      title: "投资人",
      type: "投资人",
      avatar: "A",
      stage: "长期维护",
      health: 65,
      frequency: "2-4周",
      interests: JSON.stringify(["企业AI工具", "真实落地案例", "Demo", "试点反馈"]),
      notes: "对企业AI工具和开发者效率方向感兴趣",
      lastContactAt: new Date("2026-06-12"),
    },
  });

  const lily = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "Lily",
      company: "某科技公司",
      title: "HR",
      type: "HR",
      avatar: "L",
      stage: "等待反馈",
      health: 45,
      frequency: "按需",
      interests: JSON.stringify(["技术人才", "面试流程", "薪酬范围"]),
      notes: "一面通过，等待补充材料反馈",
      lastContactAt: new Date("2026-06-13"),
    },
  });

  const chen = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "陈工",
      company: "合作方科技",
      title: "技术负责人",
      type: "合作方",
      avatar: "陈",
      stage: "技术对接",
      health: 82,
      frequency: "每周",
      interests: JSON.stringify(["接口文档", "测试环境", "排期", "API设计"]),
      notes: "合作推进顺利，有望月底前完成联调",
      lastContactAt: new Date("2026-06-17"),
    },
  });

  const zhang = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "张瑶",
      company: "YC",
      title: "合伙人",
      type: "投资人",
      avatar: "张",
      stage: "初次接触",
      health: 58,
      frequency: "待定",
      interests: JSON.stringify(["AI CRM", "行业分析", "SaaS", "个人效率工具"]),
      notes: "YC合伙人主动关注，说明赛道被认可",
      lastContactAt: new Date("2026-06-19"),
    },
  });

  const laoli = await prisma.contact.create({
    data: {
      userId: user.id,
      name: "老李",
      company: "新公司",
      title: "AI中台负责人",
      type: "人脉",
      avatar: "李",
      stage: "重新激活",
      health: 55,
      frequency: "季度",
      interests: JSON.stringify(["AI中台", "技术选型", "团队建设"]),
      notes: "前同事信任基础好，新岗位可能带来产品合作或推荐机会",
      lastContactAt: new Date("2026-06-18"),
    },
  });

  // Create interactions
  await prisma.interaction.createMany({
    data: [
      // 王总
      { contactId: wang.id, channel: "电话", summary: "了解AI运维工具需求，对方重点关注数据安全和本地部署。", date: new Date("2026-06-10") },
      { contactId: wang.id, channel: "会议", summary: "演示了SaaS版本，王总要求提供本地部署方案和成本估算。", date: new Date("2026-06-14") },
      { contactId: wang.id, channel: "邮件", summary: "王总发邮件催促本地部署方案，希望本周五前收到。", date: new Date("2026-06-18") },
      // Alex
      { contactId: alex.id, channel: "会议", summary: "对企业AI工具和开发者效率方向感兴趣，希望看到实际落地。", date: new Date("2026-05-28") },
      { contactId: alex.id, channel: "邮件", summary: "发送了第一个Demo录屏，对方建议补充真实试点反馈。", date: new Date("2026-06-12") },
      { contactId: alex.id, channel: "社媒", summary: "公开动态提到关注企业AI工具落地，与当前项目方向匹配。", date: new Date("2026-06-20") },
      // Lily
      { contactId: lily.id, channel: "面对面", summary: "一面通过，HR要求补充作品集和项目文档。", date: new Date("2026-06-05") },
      { contactId: lily.id, channel: "邮件", summary: "通过邮件发送面试补充材料和作品集。", date: new Date("2026-06-13") },
      // 陈工
      { contactId: chen.id, channel: "会议", summary: "确定合作方向，分工接口开发和数据同步。", date: new Date("2026-06-08") },
      { contactId: chen.id, channel: "邮件", summary: "发送初版接口文档，陈工反馈了5个修改建议。", date: new Date("2026-06-15") },
      { contactId: chen.id, channel: "会议", summary: "完成修订，约定今天下午开技术对接会。", date: new Date("2026-06-17") },
      // 张瑶
      { contactId: zhang.id, channel: "邮件", summary: "张瑶转发了一篇关于AI CRM的行业分析，并询问是否有兴趣交流。", date: new Date("2026-06-19") },
      // 老李
      { contactId: laoli.id, channel: "聊天", summary: "老李主动联系，提到换了新工作，在新公司负责AI中台建设。", date: new Date("2026-06-18") },
    ],
  });

  // Create commitments
  await prisma.commitment.createMany({
    data: [
      { contactId: wang.id, direction: "mine", what: "发送本地部署方案（数据安全 + 权限隔离 + 成本估算）", deadline: "本周五（6月20日）", status: "overdue", source: "6/14 线上会议" },
      { contactId: zhang.id, direction: "mine", what: "回复AI CRM方向交流邀请并约时间", deadline: "6月21日", status: "pending", source: "6/19 邮件" },
      { contactId: alex.id, direction: "mine", what: "发送产品Demo + 试点反馈数据", deadline: "本周内", status: "pending", source: "6/12 项目更新" },
      { contactId: chen.id, direction: "theirs", what: "提交数据同步模块初版代码", deadline: "本周五（6月20日）", status: "pending", source: "6/17 对接会纪要" },
      { contactId: lily.id, direction: "theirs", what: "回复面试补充材料反馈", deadline: "已超时7天", status: "overdue", source: "6/13 面试流程" },
      { contactId: chen.id, direction: "mine", what: "准备接口修订文档和问题清单", deadline: "今天15:00前", status: "pending", source: "6/17 对接会纪要" },
      { contactId: laoli.id, direction: "mine", what: "约一次详聊了解AI中台选型需求", deadline: "本周内", status: "pending", source: "6/18 聊天" },
      { contactId: wang.id, direction: "theirs", what: "确认技术演示时间和参会人", deadline: "方案发送后", status: "waiting", source: "6/14 线上会议" },
    ],
  });

  // Create inbox items
  await prisma.inboxItem.createMany({
    data: [
      { contactId: wang.id, source: "邮件", title: "王总：关于本地部署方案", preview: "你好，我们团队已经评估了你们的SaaS方案，但考虑到数据安全合规要求，希望本周五前收到本地部署版本的方案说明，重点关注数据安全、权限隔离和部署成本三个方面。", tags: JSON.stringify(["王总", "XX制造", "本地部署", "本周五截止"]), unread: true, time: "今天 09:15" },
      { contactId: chen.id, source: "日历", title: "技术对接会 - 陈工", preview: "今天 15:00-16:00，主题：接口文档修订确认、测试环境搭建、Q3排期对齐。参会人：陈工、刘伟。", tags: JSON.stringify(["陈工", "合作方科技", "接口文档", "测试环境"]), unread: true, time: "今天 15:00" },
      { contactId: lily.id, source: "邮件", title: "Lily：Re: 面试补充材料", preview: "（7天前发送的面试补充材料，至今未收到回复）", tags: JSON.stringify(["Lily", "HR", "面试", "7天未回复"]), unread: false, time: "6月13日" },
      { contactId: alex.id, source: "社媒", title: "Alex在LinkedIn发布新观点", preview: "Alex发帖称：\"最近和几家做企业级AI工具的团队深聊，发现真正打动客户的不是模型能力，而是落地场景的深度理解。看好能拿出真实ROI数据的团队。\"", tags: JSON.stringify(["Alex", "投资人", "AI工具落地", "社媒动态"]), unread: true, time: "今天 08:30" },
      { contactId: zhang.id, source: "邮件", title: "张瑶（YC）转发行业分析", preview: "你好，最近在研究个人关系管理+AI的方向，这篇文章分析了AI CRM的市场机会，和你们做的方向很像。有空交流一下吗？", tags: JSON.stringify(["张瑶", "YC", "AI CRM", "行业分析"]), unread: true, time: "昨天 16:20" },
      { contactId: laoli.id, source: "聊天", title: "老李：换工作通知", preview: "最近换到新公司了，负责AI中台建设。记得我们之前聊过的智能分析方案吗？现在这边可能用得上，有空聊聊。", tags: JSON.stringify(["老李", "前同事", "AI中台", "合作机会"]), unread: false, time: "2天前" },
      { contactId: chen.id, source: "会议纪要", title: "6/17 接口对接会纪要", preview: "【结论】1. 接口文档完成5处修订；2. 测试环境约定下周一搭建完成；3. 陈工负责数据同步模块，约定周五前提交初版。", tags: JSON.stringify(["陈工", "接口文档", "测试环境", "周五截止"]), unread: false, time: "3天前" },
      { contactId: wang.id, source: "文件", title: "本地部署方案 v0.9（草稿）", preview: "内部草稿版本，包含架构图、安全方案和成本估算。待补充权限隔离细节后可发送给王总。", tags: JSON.stringify(["本地部署", "方案", "内部文件"]), unread: false, time: "昨天 14:00" },
      { contactId: wang.id, source: "社媒", title: "XX制造官方号发布招聘信息", preview: "XX制造发布多个AI和数字化岗位招聘，包括AI运维工程师和数据安全架构师，说明公司正在加大AI投入。", tags: JSON.stringify(["XX制造", "招聘", "AI运维", "公司动态"]), unread: true, time: "今天 10:00" },
      { contactId: null, source: "日历", title: "周五 Review：本周关系进展", preview: "本周五 17:00，回顾本周关系事项进展，整理下周重点跟进。", tags: JSON.stringify(["周报", "复盘"]), unread: false, time: "本周五" },
    ],
  });

  // Create social feeds
  await prisma.socialFeed.createMany({
    data: [
      {
        contactId: alex.id,
        platform: "LinkedIn",
        person: "Alex",
        company: "某VC · 投资人",
        content: "最近和几家做企业级AI工具的团队深聊，发现真正打动客户的不是模型能力，而是落地场景的深度理解。看好能拿出真实ROI数据的团队。\n\n#企业AI #产品落地",
        aiEvent: "投资人关注方向变化",
        aiAnalysis: "Alex的观点与上次沟通中提到的\"希望看到真实落地\"一致。当前项目已有Demo和试点数据，适合发送一次简短进展更新。建议附带ROI数据和试点用户反馈。",
        aiAction: "发送产品Demo + 试点反馈 + ROI数据",
        time: "今天 08:30",
      },
      {
        contactId: wang.id,
        platform: "LinkedIn",
        person: "XX制造",
        company: "官方账号",
        content: "【招聘】XX制造数字化部门扩招！现招聘AI运维工程师、数据安全架构师、DevOps工程师等多个岗位。我们正在加速推进AI在制造业的落地应用。\n\n欢迎有兴趣的同学投递简历。",
        aiEvent: "客户公司业务扩张信号",
        aiAnalysis: "XX制造正在扩招AI和数字化团队，说明公司在加大AI投入。结合王总正在评估本地部署方案，这是一个积极信号——客户的采购意愿可能较强。",
        aiAction: "加速推进方案发送，可在沟通中提及对AI运维场景的理解",
        time: "今天 10:00",
      },
      {
        contactId: laoli.id,
        platform: "X",
        person: "老李",
        company: "新公司 · AI中台负责人",
        content: "入职第三周，AI中台项目终于启动了。从数据采集、模型服务到业务对接，一个小团队搞定全链路。创业的感觉又回来了。",
        aiEvent: "前同事岗位变动",
        aiAnalysis: "老李在新公司负责AI中台全链路建设，技术选型阶段可能需要外部工具和合作。之前有同事信任基础，适合近期约一次深入交流。",
        aiAction: "近期约一次详聊，了解技术选型需求",
        time: "昨天 20:15",
      },
    ],
  });

  console.log("Seed completed successfully!");
  console.log(`Created user: ${user.name} (${user.email})`);
  console.log(`Created 6 contacts, interactions, commitments, inbox items, and social feeds.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
