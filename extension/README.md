# LinkLoop 浏览器插件

## 安装方法

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择此 `extension` 目录

## 功能

- **保存联系人**：在 Popup 中手动输入联系人信息，一键保存到 LinkLoop
- **保存动态**：在 Popup 中粘贴社媒动态内容，保存并 AI 分析
- **页面内按钮**：在 LinkedIn 和 X/Twitter 的帖子上自动添加"保存到 LinkLoop"按钮

## 配置

在插件 Popup 中设置 LinkLoop 服务器地址（默认 `http://localhost:3000`），点击"测试连接"确认可用。

## 图标

Chrome 扩展需要 PNG 格式图标。请将 LB logo 转换为 16x16、48x48、128x128 的 PNG 文件，放在此目录。
临时可在 manifest.json 中删除 icon 相关配置来跳过。
