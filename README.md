# 每日 AI 抖音短视频草稿工作流

这是一个零代码优先的项目骨架，用来搭建“每天自动生成抖音 AI 短视频草稿”的工作流。当前阶段先不写复杂代码，只准备目录、表格结构、n8n 设计和账号清单。

## 你最终会得到什么

每天固定时间，n8n 会自动运行一条流程：

1. 搜索 AI 热点。
2. 生成选题、脚本、标题、封面文案。
3. 查找 Pexels 或 Pixabay 授权素材。
4. 用 OpenAI 生成配音。
5. 用 Creatomate 合成 1080x1920 竖版短视频草稿。
6. 把选题、脚本、素材、来源、视频状态写入 Google Sheets。
7. 生成一份人工审核清单。
8. 人工确认后，再手动去抖音发布。

## 项目结构

```text
D:\ai-douyin-workflow
├─ AGENTS.md
├─ README.md
├─ docs
│  ├─ accounts-to-register.md
│  ├─ google-sheets-schema.md
│  └─ n8n-workflow-design.md
├─ n8n
│  └─ README.md
├─ sheets
│  └─ google-sheets-headers.md
├─ prompts
│  └─ content-rules.md
├─ assets
│  └─ README.md
├─ outputs
│  ├─ audio
│  ├─ covers
│  └─ video
├─ review
│  └─ manual-review-checklist-template.md
└─ secrets
   └─ README.md
```

## 当前先做哪几件事

请按这个顺序准备：

1. 注册 `docs/accounts-to-register.md` 里的账号。
2. 新建一个 Google Sheet，并照着 `docs/google-sheets-schema.md` 创建分页和表头。
3. 在 n8n 里先创建一个空工作流，名字叫 `每日 AI 抖音短视频草稿`。
4. 在 Creatomate 里先建一个 1080x1920 的竖版模板。
5. 先不要把任何 API Key 发到聊天里，也不要写进 Google Sheets 的公开字段。

## 安全底线

- 这个项目只生成草稿，不自动发布抖音。
- 必须保留事实来源链接。
- 必须使用授权素材。
- 标题、字幕、口播、封面都禁止出现站外联系方式。
- 每条视频发布前都要人工审核。

## 参考官方入口

- n8n 工作流文档：https://docs.n8n.io/workflows/
- OpenAI 文本转语音文档：https://platform.openai.com/docs/guides/text-to-speech
- Creatomate API 文档：https://creatomate.com/docs/api/quick-start/introduction
- Pexels API：https://www.pexels.com/api/
- Pixabay API 文档：https://pixabay.com/api/docs/
- Google Cloud API 启用说明：https://docs.cloud.google.com/service-usage/docs/enabled-service

