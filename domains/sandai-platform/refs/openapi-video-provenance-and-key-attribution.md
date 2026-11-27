---
name: sandai-openapi-video-provenance-and-key-attribution
type: reference
created: 2026-11-26
updated: 2026-11-27
tags: [sandai, openapi, athena, aigc, provenance, api-key]
links: [sandai-api-platform-development-entrypoints, sandai-openapi-invalid-api-key-correlation, sandai-inference-concurrency-dashboard-entrypoints]
---

# 开放平台成片来源和 API Key 归属查证

**Why:** 疑似第三方调用或复用视频时，需要分别确认文件出处、实际模型与用 Key 的任务。提示词、分辨率、时长、可见字幕和生成风格只能用于筛候选。相同内容可由不同任务产出，同一产物可被转发。

**How to apply:** 优先保留未经平台重新编码的原始 MP4、原出参中的任务 ID 或产物 URL。用 `ffprobe -v error -show_entries format_tags=AIGC -of json` 读取容器标识。沿 [Athena 隐式标识契约](https://github.com/world-sim-dev/athena-admin/blob/main/docs/architecture/README.md#隐式标识写入契约) 和 [标识源码](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/aigc_metadata.py) 校验 `ContentProducer`、`ProduceID` 和保留字段。持有环境密钥的内部受控链路可校验标识、还原 Job ID。标签校验绑定的是标识与任务，文件内容仍需与登记产物比对。可取原始产物时比对 SHA-256，转码或裁切时对照帧序列和音轨。容器标识缺失时检查转码链路及生成路径的标识覆盖。

在 [Zeus Admin](https://zeus-admin.sandaii.cn/) 对照 Athena `jobs.request_id`、实际模型和交付产物，读取对应任务的 `orgId`、`apiKeyId`、创建时间及用量。查疑似外部调用时，在同区域按 Key ID 取完整时间窗任务，结合入口日志可见的来源和合法调用方的出站记录。账单可佐证使用。Key 的使用归属和调用者身份需要各自取证，证据只留任务 ID、Key ID 和脱敏信息。只掌握画幅和时长时，分别用建单与完成窗口，检查请求规格和实际产物元数据，避免把窗口前建单、窗口内才完成的任务漏掉。

## X 分发版标识查证（2026-11-27）

[MAGI-2 接口对齐纪要](https://j0yswlgboxz.feishu.cn/wiki/MqnOwzGCmiIWCmkRbVGcxZ59nEg#ZDgmdf51boQog7x3ez0cxOxAnih)把默认添加的标识称为隐藏元信息水印。[Athena 写入契约](https://github.com/world-sim-dev/athena-admin/blob/65a3adeb9db5abbdd9ddcd4ebbf6a2ba84a5607c/docs/architecture/README.md#L114-L124)规定在 MP4 合流时写入 `AIGC` 容器标签，适用于有无显式水印的成片，内容信号数字水印属于独立范围。

用 [Athena 的读取函数](https://github.com/world-sim-dev/athena-admin/blob/65a3adeb9db5abbdd9ddcd4ebbf6a2ba84a5607c/ApiService/services/aigc_metadata.py#L153-L173)实测 [X 帖子第一段](https://x.com/AIWarper/status/2125981679068324079/video/1) 的 1080p 分发版。读取函数返回空，文件字节也未检出 `AIGC` 字段名。同法检查 4 份 2026-11-16 国内原始验收成片，覆盖原生 v2 与 Ark 兼容接口的显式水印开关，均读出 `Label=1`。对照样本在 API 平台工作区 `.local/generation-parameter-acceptance-20261116/cn/` 的 `*watermark*.mp4`。X 样本和检查边界见 [视频编码元数据与隐形水印的查证](../../../global/pitfalls/video-codec-metadata-watermark-attribution.md)。

下次先用带标识的原始成片验证读取路径，再检查分发副本。有无 `AIGC` 的结果只覆盖容器标识，画面像素和音频波形需要已确认兼容的检测器。2026-11-27 在查阅的公开入口与 Athena 管理端源码中未定位到 MAGI-2 画面或音频专用检测器。
