# 下一步要注册哪些账号

请先按顺序注册。每注册一个账号，只需要确认“能登录”和“能看到 API Key / 凭据入口”，暂时不要把密钥发到聊天里。

## 1. Google 账号

用途：

- 创建 Google Sheets 记录选题、脚本、素材和审核状态。
- 后面让 n8n 读写表格。

你要做：

1. 打开 https://accounts.google.com/
2. 登录或注册一个专门做内容自动化的 Google 账号。
3. 打开 https://docs.google.com/spreadsheets/
4. 新建表格，命名为 `每日 AI 抖音短视频草稿库`。

后面会用到：

- Google Sheets 表格链接。
- Google Cloud 项目。
- Google Sheets API。

## 2. Google Cloud

用途：

- 给 n8n 授权访问 Google Sheets。

你要做：

1. 打开 https://console.cloud.google.com/
2. 新建一个项目，名字建议：`douyin-ai-drafts`
3. 启用 Google Sheets API。
4. 后面在 n8n 里连接 Google Sheets 凭据。

备注：Google 官方说明里提到，使用大多数 Google Cloud API 前，需要先在 Google Cloud 项目中启用对应服务。

## 3. n8n

用途：

- 每天定时执行整个自动化流程。
- 串联 OpenAI、Google Sheets、Pexels/Pixabay、Creatomate。

零代码推荐：

1. 打开 https://n8n.io/
2. 优先选择 n8n Cloud，省去服务器安装。
3. 注册后创建一个工作流，名字叫：`每日 AI 抖音短视频草稿`

后面会用到：

- n8n 登录账号。
- n8n Credentials 页面。
- Schedule Trigger 节点。
- Google Sheets 节点。
- HTTP Request 节点。
- OpenAI 节点或 HTTP Request 调 OpenAI。

## 4. OpenAI Platform

用途：

- 生成选题、脚本、标题、封面文案。
- 生成 AI 配音。

你要做：

1. 打开 https://platform.openai.com/
2. 注册或登录。
3. 进入 API Keys 页面。
4. 创建一个新的 API Key。
5. 把 Key 只保存到你的密码管理器或 n8n Credentials，别放进表格正文。

建议：

- 配音先使用 `gpt-4o-mini-tts`。
- OpenAI 官方文档说明，文本转语音可使用 `audio/speech` endpoint。

## 5. Creatomate

用途：

- 自动合成 1080x1920 竖版视频。
- 把素材、字幕、配音、标题组合成 mp4。

你要做：

1. 打开 https://creatomate.com/
2. 注册账号。
3. 创建一个 1080x1920 竖版视频模板。
4. 找到 API Key。
5. 记录 Template ID。

后面会用到：

- Creatomate API Key。
- Creatomate Template ID。

## 6. Pexels

用途：

- 搜索授权图片和视频素材。

你要做：

1. 打开 https://www.pexels.com/api/
2. 注册或登录。
3. 申请 API Key。
4. 后面把 API Key 填进 n8n Credentials。

每次使用素材必须记录：

- 素材页面链接。
- 作者名。
- 平台名。
- 授权说明链接。

## 7. Pixabay

用途：

- 作为 Pexels 的备用授权素材来源。

你要做：

1. 打开 https://pixabay.com/api/docs/
2. 注册或登录。
3. 获取 API Key。
4. 后面把 API Key 填进 n8n Credentials。

注意：Pixabay API 文档里区分图片搜索和视频搜索，视频接口是 `/api/videos/`。

## 8. 抖音创作者账号

用途：

- 人工审核通过后，手动发布视频。
- 查看作品数据。

你要做：

1. 打开 https://creator.douyin.com/
2. 登录你的抖音账号。
3. 确认可以进入创作者中心。

重要：本项目不自动发布抖音，只生成草稿、链接和审核清单。

## 9. 可选：通知工具

用途：

- 每天视频草稿生成后提醒你审核。

建议先用：

- 邮箱通知。
- n8n 内置通知。

暂时不要把微信号、手机号、QQ群等放进视频内容或表格公开字段。

