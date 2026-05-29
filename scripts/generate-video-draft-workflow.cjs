const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const workflowsDir = path.join(ROOT, 'workflows');
fs.mkdirSync(workflowsDir, { recursive: true });

const SPREADSHEET_ID = '1o3kaVQSpqxuIzTbbPAgLk1x2RPXGJcyyk2zw2WIDO_w';
const TEMPLATE_ID = '0101aa30-f8b6-4f1d-b874-091ca8b48e00';
const FOLDERS = {
  audio: '15Aq6nugl8cuYvNOtRu5Vu6SJeFduuBJt',
  video: '1lNIHLzh2K8VQpmR1-mI2Sm1VaJABLfSR',
  report: '18xvrfkSqsBPMcXQXjwuav2OZ4S1sTIlw',
};

const openAiCredential = { openAiApi: { name: 'OPENAI API KEY' } };
const sheetsCredential = { googleSheetsOAuth2Api: { name: 'Google Sheets - 抖音AI短视频自动化工作台' } };
const driveCredential = { googleDriveOAuth2Api: { name: 'GOOGLE DRIVE' } };
const pexelsCredential = { httpHeaderAuth: { name: 'Pexels API Key' } };
const creatomateCredential = { httpHeaderAuth: { name: 'Creatomate API Key' } };

function node(id, name, type, typeVersion, position, parameters, extra = {}) {
  return { id, name, type, typeVersion, position, parameters, ...extra };
}

function connect(from, to) {
  return {
    [from]: {
      main: [[{ node: to, type: 'main', index: 0 }]],
    },
  };
}

const nodes = [
  node('02000000-0000-4000-8000-000000000001', '手动测试触发', 'n8n-nodes-base.manualTrigger', 1, [-1900, 180], {}),
  node('02000000-0000-4000-8000-000000000002', 'Schedule Trigger 每天8点15', 'n8n-nodes-base.scheduleTrigger', 1.2, [-1900, 420], {
    rule: { interval: [{ field: 'cronExpression', expression: '15 8 * * *' }] },
  }),
  node('02000000-0000-4000-8000-000000000003', '初始化配置', 'n8n-nodes-base.set', 3.4, [-1660, 300], {
    assignments: {
      assignments: [
        { id: 'run-date', name: 'run_date', value: "={{ $now.setZone('Asia/Shanghai').toFormat('yyyy-LL-dd') }}", type: 'string' },
        { id: 'run-time', name: 'run_time', value: "={{ $now.setZone('Asia/Shanghai').toFormat('HH:mm:ss') }}", type: 'string' },
        { id: 'run-id', name: 'run_id', value: "={{ 'ai-video-' + $now.setZone('Asia/Shanghai').toFormat('yyyyLLdd-HHmmss') }}", type: 'string' },
        { id: 'timezone', name: 'timezone', value: 'Asia/Shanghai', type: 'string' },
        { id: 'spreadsheet_id', name: 'spreadsheet_id', value: SPREADSHEET_ID, type: 'string' },
        { id: 'template_id', name: 'template_id', value: TEMPLATE_ID, type: 'string' },
        { id: 'video_folder_id', name: 'video_folder_id', value: FOLDERS.video, type: 'string' },
        { id: 'audio_folder_id', name: 'audio_folder_id', value: FOLDERS.audio, type: 'string' },
        { id: 'report_folder_id', name: 'report_folder_id', value: FOLDERS.report, type: 'string' },
        { id: 'manual-review', name: 'manual_review_required', value: true, type: 'boolean' },
      ],
    },
    options: {},
  }),
  node('02000000-0000-4000-8000-000000000004', 'OpenAI 生成选题脚本包', 'n8n-nodes-base.httpRequest', 4.2, [-1420, 300], {
    method: 'POST',
    url: 'https://api.openai.com/v1/responses',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'openAiApi',
    sendHeaders: true,
    headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
    sendBody: true,
    specifyBody: 'json',
    jsonBody:
      "={{ JSON.stringify({ model: 'gpt-5-mini', tools: [{ type: 'web_search', search_context_size: 'medium', user_location: { type: 'approximate', country: 'CN', timezone: 'Asia/Shanghai' } }], tool_choice: 'auto', include: ['web_search_call.action.sources'], max_output_tokens: 7000, instructions: '你是中文AI短视频自动化编导。必须联网核验事实，保留来源链接；只输出可解析JSON，不要Markdown；不能出现微信号、手机号、QQ群、邮箱、Telegram、WhatsApp、加我、进群、私信领资料等站外联系方式；不能承诺赚钱、暴富、保收益；不能编造事实。', input: '今天是北京时间 ' + $json.run_date + '。请搜索今天和最近72小时人工智能热点，生成5个适合抖音45-60秒知识短视频的选题，选择总分最高的1个，并为它生成完整脚本。评分规则：热度分0-100，转化价值分0-100，总分=热度分*0.6+转化价值分*0.4。返回JSON格式：{\"topics\":[{\"日期\":\"' + $json.run_date + '\",\"选题ID\":\"AI-' + $json.run_date.replace(/-/g, '') + '-01\",\"选题标题\":\"\",\"角度\":\"\",\"目标人群\":\"\",\"热点来源URL\":\"多个URL用换行分隔\",\"热点摘要\":\"\",\"热度分\":0,\"转化价值分\":0,\"总分\":0,\"状态\":\"待生成视频\"}],\"selected_topic_id\":\"\",\"selection_reason\":\"\",\"script\":{\"日期\":\"' + $json.run_date + '\",\"脚本ID\":\"SCRIPT-' + $json.run_date.replace(/-/g, '') + '-01\",\"选题ID\":\"\",\"选题标题\":\"\",\"开头钩子\":\"0-3秒强钩子\",\"正文脚本\":\"3-10秒痛点；10-40秒3个观点；40-52秒案例；52-60秒评论区引导。完整中文口播。\",\"结尾引导\":\"只引导站内评论\",\"标题\":\"\",\"封面文案\":\"18字内\",\"评论区引导语\":\"只引导评论区互动\",\"事实来源URL\":\"多个URL用换行分隔\",\"合规风险\":\"\",\"状态\":\"待人工审核\"},\"material_keywords\":[\"artificial intelligence technology\",\"robotics\",\"data center\"]}' }) }}",
  }, { credentials: openAiCredential }),
  node('02000000-0000-4000-8000-000000000005', '解析AI生成包', 'n8n-nodes-base.code', 2, [-1180, 300], {
    jsCode: `function textFromResponse(resp) {
  if (typeof resp.output_text === 'string') return resp.output_text;
  if (!Array.isArray(resp.output)) return '';
  return resp.output.map((item) => (item.content || []).map((c) => c.text || c.output_text || '').join('')).join('');
}
function parseJsonLoose(text) {
  const cleaned = String(text || '').replace(/^\\\`\\\`\\\`json\\s*/i, '').replace(/^\\\`\\\`\\\`\\s*/i, '').replace(/\\\`\\\`\\\`$/i, '').trim();
  try { return JSON.parse(cleaned); } catch (error) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw error;
  }
}
function pick(obj, keys, fallback = '') {
  for (const key of keys) if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  return fallback;
}
const cfg = $items('初始化配置')[0].json;
const parsed = parseJsonLoose(textFromResponse($json));
const rawTopics = Array.isArray(parsed.topics) ? parsed.topics : [];
if (rawTopics.length < 5) throw new Error('OpenAI没有返回5个选题。');
const topics = rawTopics.slice(0, 5).map((topic, index) => {
  const heat = Number(pick(topic, ['热度分', 'heat_score'], 0));
  const value = Number(pick(topic, ['转化价值分', 'conversion_score'], 0));
  const total = Number(pick(topic, ['总分', 'total_score'], Math.round(heat * 0.6 + value * 0.4)));
  return {
    '日期': cfg.run_date,
    '选题ID': pick(topic, ['选题ID', 'topic_id'], 'AI-' + cfg.run_date.replace(/-/g, '') + '-' + String(index + 1).padStart(2, '0')),
    '选题标题': pick(topic, ['选题标题', 'title', 'topic'], ''),
    '角度': pick(topic, ['角度', 'angle'], ''),
    '目标人群': pick(topic, ['目标人群', 'target_audience'], ''),
    '热点来源URL': String(pick(topic, ['热点来源URL', 'source_urls'], '')),
    '热点摘要': pick(topic, ['热点摘要', 'summary'], ''),
    '热度分': heat,
    '转化价值分': value,
    '总分': total,
    '状态': pick(topic, ['状态', 'status'], '待生成视频'),
  };
}).sort((a, b) => Number(b['总分']) - Number(a['总分']));
const selectedId = parsed.selected_topic_id || parsed['selected_topic_id'] || parsed['选题ID'] || topics[0]['选题ID'];
const selected = topics.find((topic) => topic['选题ID'] === selectedId) || topics[0];
const script = parsed.script || {};
const forbidden = /(微信|weixin|wechat|vx|v信|手机号|电话|QQ|QQ群|邮箱|email|Telegram|WhatsApp|加我|进群|私信领资料|扫码)/i;
const risks = [];
if (forbidden.test(JSON.stringify(script))) risks.push('疑似出现站外联系方式，请人工修改');
const scriptRow = {
  '日期': cfg.run_date,
  '脚本ID': pick(script, ['脚本ID', 'script_id'], 'SCRIPT-' + cfg.run_date.replace(/-/g, '') + '-01'),
  '选题ID': selected['选题ID'],
  '选题标题': selected['选题标题'],
  '开头钩子': pick(script, ['开头钩子', 'opening_hook'], ''),
  '正文脚本': pick(script, ['正文脚本', 'body_script', 'script'], ''),
  '结尾引导': pick(script, ['结尾引导', 'ending_cta'], ''),
  '标题': pick(script, ['标题', 'title'], selected['选题标题']),
  '封面文案': pick(script, ['封面文案', 'cover_text'], ''),
  '评论区引导语': pick(script, ['评论区引导语', 'comment_guide'], ''),
  '事实来源URL': pick(script, ['事实来源URL', 'fact_source_urls'], selected['热点来源URL']),
  '合规风险': [pick(script, ['合规风险', 'compliance_risk'], ''), ...risks].filter(Boolean).join('；') || '未发现明显风险，仍需人工审核',
  '状态': risks.length ? '需要人工修改' : '待人工审核',
};
const materialKeywords = Array.isArray(parsed.material_keywords) && parsed.material_keywords.length ? parsed.material_keywords : ['artificial intelligence technology'];
return [{ json: { ...cfg, topics, selected_topic: selected, script_row: scriptRow, material_keywords: materialKeywords, search_query: materialKeywords[0] } }];`,
  }),
  node('02000000-0000-4000-8000-000000000006', '准备选题库行', 'n8n-nodes-base.code', 2, [-940, 160], {
    jsCode: "return ($items('解析AI生成包')[0].json.topics || []).map((topic) => ({ json: topic }));",
  }),
  node('02000000-0000-4000-8000-000000000007', 'Google Sheets 写入选题库', 'n8n-nodes-base.googleSheets', 4.7, [-700, 160], {
    operation: 'append',
    documentId: { __rl: true, value: SPREADSHEET_ID, mode: 'id' },
    sheetName: { __rl: true, value: '选题库', mode: 'name' },
    columns: {
      mappingMode: 'defineBelow',
      value: {
        '日期': "={{ $json['日期'] }}",
        '选题ID': "={{ $json['选题ID'] }}",
        '选题标题': "={{ $json['选题标题'] }}",
        '角度': "={{ $json['角度'] }}",
        '目标人群': "={{ $json['目标人群'] }}",
        '热点来源URL': "={{ $json['热点来源URL'] }}",
        '热点摘要': "={{ $json['热点摘要'] }}",
        '热度分': "={{ $json['热度分'] }}",
        '转化价值分': "={{ $json['转化价值分'] }}",
        '总分': "={{ $json['总分'] }}",
        '状态': "={{ $json['状态'] }}",
      },
      matchingColumns: [],
      schema: [],
      attemptToConvertTypes: false,
      convertFieldsToString: true,
    },
    options: {},
  }, { credentials: sheetsCredential }),
  node('02000000-0000-4000-8000-000000000008', '回到生成包', 'n8n-nodes-base.code', 2, [-460, 160], {
    jsCode: "return [{ json: $items('解析AI生成包')[0].json }];",
  }),
  node('02000000-0000-4000-8000-000000000009', 'Google Sheets 写入脚本库', 'n8n-nodes-base.googleSheets', 4.7, [-220, 160], {
    operation: 'append',
    documentId: { __rl: true, value: SPREADSHEET_ID, mode: 'id' },
    sheetName: { __rl: true, value: '脚本库', mode: 'name' },
    columns: {
      mappingMode: 'defineBelow',
      value: {
        '日期': "={{ $json.script_row['日期'] }}",
        '脚本ID': "={{ $json.script_row['脚本ID'] }}",
        '选题ID': "={{ $json.script_row['选题ID'] }}",
        '选题标题': "={{ $json.script_row['选题标题'] }}",
        '开头钩子': "={{ $json.script_row['开头钩子'] }}",
        '正文脚本': "={{ $json.script_row['正文脚本'] }}",
        '结尾引导': "={{ $json.script_row['结尾引导'] }}",
        '标题': "={{ $json.script_row['标题'] }}",
        '封面文案': "={{ $json.script_row['封面文案'] }}",
        '评论区引导语': "={{ $json.script_row['评论区引导语'] }}",
        '事实来源URL': "={{ $json.script_row['事实来源URL'] }}",
        '合规风险': "={{ $json.script_row['合规风险'] }}",
        '状态': "={{ $json.script_row['状态'] }}",
      },
      matchingColumns: [],
      schema: [],
      attemptToConvertTypes: false,
      convertFieldsToString: true,
    },
    options: {},
  }, { credentials: sheetsCredential }),
  node('02000000-0000-4000-8000-000000000010', 'Pexels 搜索授权视频', 'n8n-nodes-base.httpRequest', 4.2, [20, 160], {
    url: 'https://api.pexels.com/videos/search',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    sendQuery: true,
    queryParameters: {
      parameters: [
        { name: 'query', value: '={{ $json.search_query }}' },
        { name: 'orientation', value: 'portrait' },
        { name: 'per_page', value: '5' },
        { name: 'size', value: 'large' },
      ],
    },
    options: {},
  }, { credentials: pexelsCredential, continueOnFail: true }),
  node('02000000-0000-4000-8000-000000000011', '选择授权素材', 'n8n-nodes-base.code', 2, [260, 160], {
    jsCode: `const base = $items('回到生成包')[0].json;
const videos = Array.isArray($json.videos) ? $json.videos : [];
const video = videos[0];
let material = null;
if (video) {
  const files = Array.isArray(video.video_files) ? video.video_files : [];
  const file = files
    .filter((f) => String(f.file_type || '').includes('mp4') || String(f.link || '').includes('.mp4'))
    .sort((a, b) => (b.height || 0) - (a.height || 0))[0] || files[0];
  if (file && file.link) {
    material = {
      platform: 'Pexels',
      asset_id: String(video.id || ''),
      page_url: video.url || '',
      download_url: file.link,
      author: video.user && video.user.name ? video.user.name : '',
      author_url: video.user && video.user.url ? video.user.url : '',
      license_url: 'https://www.pexels.com/license/',
      search_keyword: base.search_query,
    };
  }
}
if (!material) throw new Error('Pexels没有返回可用的授权竖版视频素材，请换关键词或检查Pexels Credential。');
return [{ json: { ...base, material, material_status: '素材已找到' } }];`,
  }),
  node('02000000-0000-4000-8000-000000000012', 'OpenAI TTS 生成配音', 'n8n-nodes-base.httpRequest', 4.2, [500, 160], {
    method: 'POST',
    url: 'https://api.openai.com/v1/audio/speech',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'openAiApi',
    sendHeaders: true,
    headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
    sendBody: true,
    specifyBody: 'json',
    jsonBody: "={{ JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'coral', input: $json.script_row['正文脚本'], response_format: 'mp3' }) }}",
    options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } } },
  }, { credentials: openAiCredential }),
  node('02000000-0000-4000-8000-000000000013', '准备音频DataURI', 'n8n-nodes-base.code', 2, [740, 160], {
    jsCode: `const base = $items('选择授权素材')[0].json;
const buffer = await this.helpers.getBinaryDataBuffer(0, 'data');
const binary = items[0].binary || {};
binary.data.fileName = base.script_row['脚本ID'] + '.mp3';
binary.data.mimeType = 'audio/mpeg';
return [{
  json: {
    ...base,
    audio_filename: base.script_row['脚本ID'] + '.mp3',
    audio_data_uri: 'data:audio/mpeg;base64,' + buffer.toString('base64')
  },
  binary
}];`,
  }),
  node('02000000-0000-4000-8000-000000000014', '上传配音到Drive', 'n8n-nodes-base.googleDrive', 3, [980, 160], {
    name: '={{ $json.audio_filename }}',
    driveId: { __rl: true, mode: 'list', value: 'My Drive' },
    folderId: { __rl: true, value: FOLDERS.audio, mode: 'id' },
    options: {},
  }, { credentials: driveCredential }),
  node('02000000-0000-4000-8000-000000000015', 'Creatomate 创建渲染', 'n8n-nodes-base.httpRequest', 4.2, [1220, 160], {
    method: 'POST',
    url: 'https://api.creatomate.com/v2/renders',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    sendHeaders: true,
    headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
    sendBody: true,
    specifyBody: 'json',
    jsonBody:
      "={{ JSON.stringify({ template_id: $node['准备音频DataURI'].json.template_id, modifications: { title_text: $node['准备音频DataURI'].json.script_row['标题'], subtitle_text: $node['准备音频DataURI'].json.script_row['正文脚本'], background_video: $node['准备音频DataURI'].json.material.download_url, voice_audio: $node['准备音频DataURI'].json.audio_data_uri, cta_text: $node['准备音频DataURI'].json.script_row['评论区引导语'], cover_text: $node['准备音频DataURI'].json.script_row['封面文案'] }, render_scale: 1, metadata: JSON.stringify({ run_id: $node['准备音频DataURI'].json.run_id, script_id: $node['准备音频DataURI'].json.script_row['脚本ID'] }) }) }}",
    options: {},
  }, { credentials: creatomateCredential }),
  node('02000000-0000-4000-8000-000000000016', '等待Creatomate渲染4分钟', 'n8n-nodes-base.wait', 1.1, [1460, 160], {
    amount: 4,
    unit: 'minutes',
  }),
  node('02000000-0000-4000-8000-000000000017', 'Creatomate 查询渲染状态', 'n8n-nodes-base.httpRequest', 4.2, [1700, 160], {
    url: "={{ 'https://api.creatomate.com/v2/renders/' + (($node['Creatomate 创建渲染'].json.id) || ($node['Creatomate 创建渲染'].json[0] && $node['Creatomate 创建渲染'].json[0].id) || '') }}",
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    options: {},
  }, { credentials: creatomateCredential, continueOnFail: true }),
  node('02000000-0000-4000-8000-000000000018', '整理视频结果', 'n8n-nodes-base.code', 2, [1940, 160], {
    jsCode: `const base = $items('准备音频DataURI')[0].json;
const audioDrive = $items('上传配音到Drive')[0].json;
const createdRaw = $items('Creatomate 创建渲染')[0].json;
const created = Array.isArray(createdRaw) ? createdRaw[0] : createdRaw;
const statusRaw = $json || {};
const render = Array.isArray(statusRaw) ? statusRaw[0] : statusRaw;
const finalRender = render && render.id ? render : created;
if (!finalRender || !finalRender.url) {
  throw new Error('Creatomate还没有生成视频URL。当前状态：' + (finalRender && finalRender.status ? finalRender.status : 'unknown') + '。可以稍后在Creatomate里查看Render ID：' + (finalRender && finalRender.id ? finalRender.id : 'unknown'));
}
return [{ json: {
  ...base,
  audio_drive_id: audioDrive.id || '',
  audio_drive_link: audioDrive.webViewLink || '',
  render_id: finalRender.id || '',
  render_status: finalRender.status || '',
  render_url: finalRender.url || '',
  snapshot_url: finalRender.snapshot_url || '',
  video_id: 'VIDEO-' + base.run_date.replace(/-/g, '') + '-01',
  video_filename: base.run_date + '_' + base.script_row['脚本ID'] + '_douyin_ai_draft.mp4',
  report_filename: base.run_date + '_' + base.script_row['脚本ID'] + '_compliance_report.md'
} }];`,
  }),
  node('02000000-0000-4000-8000-000000000019', '下载Creatomate视频', 'n8n-nodes-base.httpRequest', 4.2, [2180, 160], {
    url: '={{ $json.render_url }}',
    options: { response: { response: { responseFormat: 'file', outputPropertyName: 'data' } } },
  }),
  node('02000000-0000-4000-8000-000000000020', '上传视频到Drive', 'n8n-nodes-base.googleDrive', 3, [2420, 160], {
    name: "={{ $node['整理视频结果'].json.video_filename }}",
    driveId: { __rl: true, mode: 'list', value: 'My Drive' },
    folderId: { __rl: true, value: FOLDERS.video, mode: 'id' },
    options: {},
  }, { credentials: driveCredential }),
  node('02000000-0000-4000-8000-000000000021', '生成合规报告文件', 'n8n-nodes-base.code', 2, [2660, 160], {
    jsCode: `const result = $items('整理视频结果')[0].json;
const videoDrive = $items('上传视频到Drive')[0].json;
const lines = [
  '# 抖音AI短视频草稿合规报告',
  '',
  '- 日期：' + result.run_date,
  '- 视频ID：' + result.video_id,
  '- 脚本ID：' + result.script_row['脚本ID'],
  '- 视频标题：' + result.script_row['标题'],
  '- Google Drive 视频链接：' + (videoDrive.webViewLink || ''),
  '- 配音文件链接：' + result.audio_drive_link,
  '- Creatomate Render ID：' + result.render_id,
  '',
  '## 发布前人工审核清单',
  '',
  '- [ ] 标题、字幕、封面、口播、评论区引导语没有微信号、手机号、QQ群、邮箱等站外联系方式。',
  '- [ ] 没有承诺赚钱、暴富、保收益。',
  '- [ ] 所有事实性内容都能在来源链接里找到。',
  '- [ ] 素材来自 Pexels 授权素材库，并记录作者和授权说明。',
  '- [ ] 视频为 1080x1920 竖版，字幕清晰。',
  '- [ ] 人工确认后再发布到抖音，workflow 不自动发布。',
  '',
  '## 事实来源URL',
  '',
  result.script_row['事实来源URL'] || '',
  '',
  '## 素材信息',
  '',
  '- 来源：' + result.material.platform,
  '- 作者：' + result.material.author,
  '- 素材页：' + result.material.page_url,
  '- 授权说明：' + result.material.license_url,
  '',
  '## 合规风险',
  '',
  result.script_row['合规风险'] || '未发现明显风险，仍需人工审核'
];
const report = lines.join('\\n');
return [{
  json: { ...result, video_drive_id: videoDrive.id || '', video_drive_link: videoDrive.webViewLink || '', compliance_report: report },
  binary: {
    data: {
      data: Buffer.from(report, 'utf8').toString('base64'),
      mimeType: 'text/markdown',
      fileName: result.report_filename
    }
  }
}];`,
  }),
  node('02000000-0000-4000-8000-000000000022', '上传合规报告到Drive', 'n8n-nodes-base.googleDrive', 3, [2900, 160], {
    name: "={{ $node['生成合规报告文件'].json.report_filename }}",
    driveId: { __rl: true, mode: 'list', value: 'My Drive' },
    folderId: { __rl: true, value: FOLDERS.report, mode: 'id' },
    options: {},
  }, { credentials: driveCredential }),
  node('02000000-0000-4000-8000-000000000023', 'Google Sheets 写入素材库', 'n8n-nodes-base.googleSheets', 4.7, [3140, 160], {
    operation: 'append',
    documentId: { __rl: true, value: SPREADSHEET_ID, mode: 'id' },
    sheetName: { __rl: true, value: '素材库', mode: 'name' },
    columns: {
      mappingMode: 'defineBelow',
      value: {
        '日期': "={{ $node['生成合规报告文件'].json.run_date }}",
        '素材ID': "={{ $node['生成合规报告文件'].json.material.platform + '-' + $node['生成合规报告文件'].json.material.asset_id }}",
        '脚本ID': "={{ $node['生成合规报告文件'].json.script_row['脚本ID'] }}",
        '素材用途': '背景视频',
        '关键词': "={{ $node['生成合规报告文件'].json.material.search_keyword }}",
        '素材来源': "={{ $node['生成合规报告文件'].json.material.platform }}",
        '作者': "={{ $node['生成合规报告文件'].json.material.author }}",
        '授权说明': "={{ $node['生成合规报告文件'].json.material.license_url }}",
        '素材链接': "={{ $node['生成合规报告文件'].json.material.page_url }}",
        '本地或云端链接': "={{ $node['生成合规报告文件'].json.material.download_url }}",
        '是否已使用': '是',
        '对应视频ID': "={{ $node['生成合规报告文件'].json.video_id }}",
      },
      matchingColumns: [],
      schema: [],
      attemptToConvertTypes: false,
      convertFieldsToString: true,
    },
    options: {},
  }, { credentials: sheetsCredential }),
  node('02000000-0000-4000-8000-000000000024', 'Google Sheets 写入视频成品', 'n8n-nodes-base.googleSheets', 4.7, [3380, 160], {
    operation: 'append',
    documentId: { __rl: true, value: SPREADSHEET_ID, mode: 'id' },
    sheetName: { __rl: true, value: '视频成品', mode: 'name' },
    columns: {
      mappingMode: 'defineBelow',
      value: {
        '日期': "={{ $node['生成合规报告文件'].json.run_date }}",
        '视频ID': "={{ $node['生成合规报告文件'].json.video_id }}",
        '脚本ID': "={{ $node['生成合规报告文件'].json.script_row['脚本ID'] }}",
        '视频标题': "={{ $node['生成合规报告文件'].json.script_row['标题'] }}",
        '视频链接': "={{ $node['生成合规报告文件'].json.video_drive_link }}",
        '封面链接': "={{ $node['生成合规报告文件'].json.snapshot_url }}",
        '配音链接': "={{ $node['生成合规报告文件'].json.audio_drive_link }}",
        '字幕链接': '',
        '审核状态': '待人工审核',
        '修改意见': '发布前请检查合规报告和事实来源，不要自动发布抖音。',
        '发布状态': '未发布',
        '合规报告链接': "={{ $json.webViewLink || '' }}",
      },
      matchingColumns: [],
      schema: [],
      attemptToConvertTypes: false,
      convertFieldsToString: true,
    },
    options: {},
  }, { credentials: sheetsCredential }),
  node('02000000-0000-4000-8000-000000000025', '准备任务日历行', 'n8n-nodes-base.code', 2, [3620, 160], {
    jsCode: `const result = $items('生成合规报告文件')[0].json;
return [{ json: {
  '日期': result.run_date,
  '任务时间': result.run_time,
  '任务类型': '02_每日AI视频草稿全流程',
  '状态': 'success',
  '负责人': 'n8n 自动化',
  '备注': '视频草稿已保存到Google Drive：' + result.video_drive_link + '；发布状态：未发布；必须人工审核后再发抖音。'
} }];`,
  }),
  node('02000000-0000-4000-8000-000000000026', 'Google Sheets 写入任务日历', 'n8n-nodes-base.googleSheets', 4.7, [3860, 160], {
    operation: 'append',
    documentId: { __rl: true, value: SPREADSHEET_ID, mode: 'id' },
    sheetName: { __rl: true, value: '任务日历', mode: 'name' },
    columns: {
      mappingMode: 'defineBelow',
      value: {
        '日期': "={{ $json['日期'] }}",
        '任务时间': "={{ $json['任务时间'] }}",
        '任务类型': "={{ $json['任务类型'] }}",
        '状态': "={{ $json['状态'] }}",
        '负责人': "={{ $json['负责人'] }}",
        '备注': "={{ $json['备注'] }}",
      },
      matchingColumns: [],
      schema: [],
      attemptToConvertTypes: false,
      convertFieldsToString: true,
    },
    options: {},
  }, { credentials: sheetsCredential }),
];

const connections = Object.assign(
  {},
  connect('手动测试触发', '初始化配置'),
  connect('Schedule Trigger 每天8点15', '初始化配置'),
  connect('初始化配置', 'OpenAI 生成选题脚本包'),
  connect('OpenAI 生成选题脚本包', '解析AI生成包'),
  connect('解析AI生成包', '准备选题库行'),
  connect('准备选题库行', 'Google Sheets 写入选题库'),
  connect('Google Sheets 写入选题库', '回到生成包'),
  connect('回到生成包', 'Google Sheets 写入脚本库'),
  connect('Google Sheets 写入脚本库', 'Pexels 搜索授权视频'),
  connect('Pexels 搜索授权视频', '选择授权素材'),
  connect('选择授权素材', 'OpenAI TTS 生成配音'),
  connect('OpenAI TTS 生成配音', '准备音频DataURI'),
  connect('准备音频DataURI', '上传配音到Drive'),
  connect('上传配音到Drive', 'Creatomate 创建渲染'),
  connect('Creatomate 创建渲染', '等待Creatomate渲染4分钟'),
  connect('等待Creatomate渲染4分钟', 'Creatomate 查询渲染状态'),
  connect('Creatomate 查询渲染状态', '整理视频结果'),
  connect('整理视频结果', '下载Creatomate视频'),
  connect('下载Creatomate视频', '上传视频到Drive'),
  connect('上传视频到Drive', '生成合规报告文件'),
  connect('生成合规报告文件', '上传合规报告到Drive'),
  connect('上传合规报告到Drive', 'Google Sheets 写入素材库'),
  connect('Google Sheets 写入素材库', 'Google Sheets 写入视频成品'),
  connect('Google Sheets 写入视频成品', '准备任务日历行'),
  connect('准备任务日历行', 'Google Sheets 写入任务日历'),
);

const workflow = {
  name: '02_每日AI视频草稿全流程',
  active: false,
  nodes,
  connections,
  pinData: {},
  settings: { timezone: 'Asia/Shanghai', executionOrder: 'v1' },
  staticData: null,
  meta: { templateCredsSetupCompleted: true },
  tags: [],
  triggerCount: 0,
};

const chinesePath = path.join(workflowsDir, '02_每日AI视频草稿全流程.json');
const asciiPath = path.join(workflowsDir, '02_daily_ai_video_draft_full.json');
const serialized = JSON.stringify(workflow, null, 2);
fs.writeFileSync(chinesePath, serialized + '\n', 'utf8');
fs.writeFileSync(asciiPath, serialized + '\n', 'utf8');
console.log(chinesePath);
console.log(asciiPath);
