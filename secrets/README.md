# secrets 文件夹说明

这里不应该保存真实 API Key。

更推荐的做法：

1. API Key 放进密码管理器。
2. API Key 填进 n8n 的 Credentials。
3. Google Sheets 只记录“状态”和“链接”，不记录密钥。

如果以后为了本地测试临时创建 `.env` 文件，请不要分享、不要上传。

