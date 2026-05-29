# Google Drive 设置说明

## 1. 主文件夹名称

抖音AI短视频自动化素材库

## 2. 主文件夹链接

https://drive.google.com/drive/folders/11IKjVt9rJEXESE6uLx0AHm7liKilX4FU

## 3. 主文件夹 ID

```text
11IKjVt9rJEXESE6uLx0AHm7liKilX4FU
```

## 4. 子文件夹

| 子文件夹名称 | 用途 | n8n 后续保存内容 |
| --- | --- | --- |
| voice_audio_配音 | 存放 OpenAI TTS 生成的配音文件。 | 配音音频、旁白音频。 |
| video_drafts_视频草稿 | 存放 Creatomate 自动合成的竖版视频草稿。 | 待人工审核的视频成品、不同版本的视频草稿。 |
| cover_images_封面图 | 存放短视频封面图和封面文案相关图片。 | 封面图片、封面图备选版本。 |
| compliance_reports_合规报告 | 存放发布前人工审核和合规检查文件。 | 合规报告、人工审核清单、风险说明。 |

## 4.1 子文件夹 ID

| 子文件夹名称 | Folder ID |
| --- | --- |
| `voice_audio_配音` | `15Aq6nugl8cuYvNOtRu5Vu6SJeFduuBJt` |
| `video_drafts_视频草稿` | `1lNIHLzh2K8VQpmR1-mI2Sm1VaJABLfSR` |
| `cover_images_封面图` | `1Z5q3UKEx9SArLCBHPC4JZkNGRyE9D3TY` |
| `compliance_reports_合规报告` | `18xvrfkSqsBPMcXQXjwuav2OZ4S1sTIlw` |

## 5. 注意事项

- 不要在 Google Drive 文件夹里保存任何 API Key、密码、Token、Cookie、验证码或其他敏感凭证。
- 不要把主文件夹或子文件夹设置成“任何人可编辑”。
- 默认保持 Google Drive 私密权限，只给自己或必要协作者访问。
- 不要上传未经授权的抖音、B站、小红书、YouTube 搬运视频。
- n8n 后续生成配音、视频、封面、合规报告时，应优先保存到这些文件夹。

## 6. n8n 后续连接建议

n8n 后续使用 Google Drive 节点保存文件时：

1. 配音文件保存到 `voice_audio_配音`。
2. 视频草稿保存到 `video_drafts_视频草稿`。
3. 封面图保存到 `cover_images_封面图`。
4. 合规报告和人工审核清单保存到 `compliance_reports_合规报告`。

如果 n8n 需要填写父级文件夹 ID，可以使用主文件夹 ID：

```text
11IKjVt9rJEXESE6uLx0AHm7liKilX4FU
```

如果 n8n 需要填写具体子文件夹 ID，请在 Google Drive 里打开对应子文件夹，复制浏览器地址栏中 `folders/` 后面的那串字符。
