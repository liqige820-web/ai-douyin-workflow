# n8n 工作流导入、配置、测试和发布说明

工作流 JSON 文件：

`n8n/daily-ai-douyin-draft.workflow.json`

工作流名称：

`每日 AI 抖音短视频草稿`

运行时间：

每天北京时间早上 8 点。

## 重要说明

这个工作流只生成草稿、写入 Google Sheets、通知你审核，不会自动发布抖音。

OpenAI TTS 生成的是 MP3 文件，Creatomate 需要读取公网可访问的音频 URL。为了解决这个衔接问题，工作流默认使用 Cloudinary 无签名上传，把 MP3 临时变成公开 URL，再交给 Creatomate 合成视频。

## 节点中文解释

1. `Schedule Trigger 每天8点`
   每天北京时间 08:00 自动启动。工作流设置里已设置 `Asia/Shanghai`。

2. `初始化配置`
   生成当天日期、运行 ID、视频尺寸、目标时长等基础字段。

3. `OpenAI 搜索并生成5个选题`
   调用 OpenAI Responses API，启用 `web_search`，联网搜索当天和最近 72 小时 AI 热点，并输出 5 个抖音选题。

4. `选择评分最高选题`
   从 5 个选题里按评分排序，选择最高分的 1 个。

5. `OpenAI 生成脚本标题封面`
   基于最高分选题生成 60 秒口播脚本、字幕、标题、封面文案、评论区引导语、分镜、事实来源和素材关键词。

6. `解析脚本并合规检查`
   解析 OpenAI 返回的 JSON，检查是否出现微信号、手机号、QQ群、邮箱等站外联系方式，并检查来源链接数量。

7. `Pexels 搜索授权视频`
   使用 Pexels API 搜索竖版授权视频素材。

8. `Pixabay 搜索授权视频`
   使用 Pixabay API 搜索备用授权视频素材。

9. `选择授权素材`
   优先选 Pexels 视频；如果 Pexels 没有结果，再选 Pixabay 视频，并记录素材页面、作者和授权说明链接。

10. `OpenAI TTS 生成配音`
    调用 OpenAI TTS，把口播脚本生成 MP3 配音。

11. `上传配音到 Cloudinary`
    把 MP3 上传到 Cloudinary，获得 Creatomate 可读取的公网音频 URL。

12. `准备 Creatomate RenderScript`
    生成 1080x1920 竖版视频合成参数，包括授权视频、配音、封面文案和字幕块。

13. `Creatomate 合成竖版视频`
    调用 Creatomate API 创建渲染任务。

14. `等待 Creatomate 2分钟`
    等待渲染一段时间，给 Creatomate 处理视频。

15. `Creatomate 查询渲染状态`
    查询视频是否渲染完成。若仍在渲染，Google Sheets 会记录 Render ID，之后可手动查看。

16. `整理最终结果`
    汇总选题、脚本、素材、来源、配音链接、视频链接、审核状态和备注。

17. `写入 Google Sheets`
    把最终草稿写入 Google Sheets 的 `视频草稿` 分页。

18. `生成审核通知内容`
    生成发给你的审核提醒文本。

19. `是否飞书通知`
    如果变量 `NOTIFY_CHANNEL` 是 `feishu`，走飞书机器人通知。

20. `飞书通知审核`
    通过飞书群机器人 Webhook 发审核提醒。

21. `是否企业微信通知`
    如果变量 `NOTIFY_CHANNEL` 是 `wecom`，走企业微信机器人通知。

22. `企业微信通知审核`
    通过企业微信群机器人 Webhook 发审核提醒。

23. `是否邮箱通知`
    如果变量 `NOTIFY_CHANNEL` 是 `email`，走 SMTP 邮箱通知。

24. `邮箱通知审核`
    通过 n8n 的 Send Email 节点发审核邮件。

25. `未配置通知通道`
    如果通知通道不是 `feishu`、`wecom`、`email`，流程结束但不发送通知。

## 需要手动填写哪些 API Key 和变量

在 n8n 里点左侧 `Settings` → `Variables`，新增这些变量。

必填：

```text
OPENAI_API_KEY=你的 OpenAI API Key
PEXELS_API_KEY=你的 Pexels API Key
PIXABAY_API_KEY=你的 Pixabay API Key
CREATOMATE_API_KEY=你的 Creatomate API Key
GOOGLE_SHEET_ID=你的 Google Sheets 表格 ID
CLOUDINARY_CLOUD_NAME=你的 Cloudinary Cloud name
CLOUDINARY_UPLOAD_PRESET=你的 Cloudinary unsigned upload preset
NOTIFY_CHANNEL=feishu
```

OpenAI 可选：

```text
OPENAI_RESPONSES_MODEL=gpt-4.1-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=coral
```

飞书通知二选一、三选一时填写：

```text
FEISHU_WEBHOOK_URL=你的飞书机器人 Webhook 地址
```

企业微信通知时填写：

```text
WECOM_WEBHOOK_URL=你的企业微信机器人 Webhook 地址
```

邮箱通知时填写：

```text
EMAIL_FROM=发件邮箱
EMAIL_TO=收件邮箱
```

还需要在 n8n 里配置这些凭据：

- `Google Sheets OAuth2`：给 `写入 Google Sheets` 节点使用。
- `SMTP account`：只有选择邮箱通知时才需要。

## Google Sheets 准备

请确认你的 Google Sheet 里有 `视频草稿` 分页，并且第一行表头来自：

`sheets/google-sheets-headers.md`

最少要有这些列：

```text
脚本ID,日期,选题,口播脚本,字幕文案,标题候选1,标题候选2,标题候选3,封面文案,画面分镜,配音文本,OpenAI配音状态,音频链接或路径,Creatomate模板ID,Creatomate渲染ID,视频链接或路径,视频状态,审核状态,发布状态,备注
```

## 在 n8n 里点哪里导入

1. 打开 n8n。
2. 左侧点 `Workflows`。
3. 右上角点 `Create Workflow`。
4. 进入画布后，右上角点三个点 `...`。
5. 点 `Import from File`。
6. 选择本项目里的文件：
   `D:\ai-douyin-workflow\n8n\daily-ai-douyin-draft.workflow.json`
7. 导入后先不要发布。
8. 右上角点 `Save`。

## 导入后需要检查的节点

导入后，逐个双击这些节点确认：

1. `写入 Google Sheets`
   选择你的 Google Sheets OAuth2 凭据。
   确认 Document 是你的表格。
   确认 Sheet 是 `视频草稿`。

2. `邮箱通知审核`
   如果你用邮箱通知，选择 SMTP 凭据。
   如果你不用邮箱通知，可以不管它。

3. `是否飞书通知`
   默认 `NOTIFY_CHANNEL=feishu`。
   如果你用企业微信，把变量改成 `wecom`。
   如果你用邮箱，把变量改成 `email`。

## 如何测试

建议先手动跑一次，不要直接发布。

1. 打开工作流。
2. 确认所有变量都填好了。
3. 点画布底部或右上角的 `Execute workflow`。
4. 从左到右观察每个节点是否变绿。
5. 如果某个节点变红，双击红色节点，看 `Output` 或 `Error`。
6. 测试成功的标准：
   - Google Sheets 的 `视频草稿` 新增一行。
   - 行里有选题、脚本、来源链接、素材链接、音频链接、Creatomate Render ID。
   - 飞书、企业微信或邮箱收到审核提醒。

第一次测试最容易出错的地方：

- OpenAI API Key 没填或额度不足。
- Pexels/Pixabay Key 没填。
- Cloudinary upload preset 不是 unsigned。
- Google Sheets 凭据没授权。
- Google Sheets 表头和节点映射列名不一致。
- Creatomate 渲染还没完成，视频状态显示 `rendering`。这种情况可以稍后用 Render ID 去 Creatomate 查看。

## 如何发布 workflow

确认手动测试通过后：

1. 打开工作流。
2. 右上角点 `Save`。
3. 右上角找到 `Inactive / Active` 开关。
4. 切换为 `Active`。
5. 如果 n8n 提醒你发布或激活，点确认。

发布后，它会每天北京时间早上 8 点自动运行。

## 安全提醒

- 不要把真实 API Key 提交到 GitHub。
- 不要把 API Key 写进 Google Sheets。
- 不要自动发布抖音。
- 每条视频发布前必须人工审核。
- 标题、字幕、口播、封面和评论引导语都不能出现站外联系方式。

