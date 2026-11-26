---
name: sandai-openapi-video-provenance-and-key-attribution
type: reference
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, openapi, athena, aigc, provenance, api-key]
links: [sandai-api-platform-development-entrypoints, sandai-openapi-invalid-api-key-correlation, sandai-inference-concurrency-dashboard-entrypoints]
---

# 开放平台成片来源和 API Key 归属查证

**Why:** 疑似第三方调用或复用视频时，需要分别确认文件出处、实际模型与用 Key 的任务。提示词、分辨率、时长、可见字幕和生成风格只能用于筛候选。相同内容可由不同任务产出，同一产物可被转发。

**How to apply:** 优先保留未经平台重新编码的原始 MP4、原出参中的任务 ID 或产物 URL。用 `ffprobe -v error -show_entries format_tags=AIGC -of json` 读取容器标识。沿 [Athena 隐式标识契约](https://github.com/world-sim-dev/athena-admin/blob/main/docs/architecture/README.md#隐式标识写入契约) 和 [标识源码](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/aigc_metadata.py) 校验 `ContentProducer`、`ProduceID` 和保留字段。持有环境密钥的内部受控链路可校验标识、还原 Job ID。标签校验绑定的是标识与任务，文件内容仍需与登记产物比对。可取原始产物时比对 SHA-256，转码或裁切时对照帧序列和音轨。容器标识缺失时检查转码链路及生成路径的标识覆盖。

在 [Zeus Admin](https://zeus-admin.sandaii.cn/) 对照 Athena `jobs.request_id`、实际模型和交付产物，读取对应任务的 `orgId`、`apiKeyId`、创建时间及用量。查疑似外部调用时，在同区域按 Key ID 取完整时间窗任务，结合入口日志可见的来源和合法调用方的出站记录。账单可佐证使用。Key 的使用归属和调用者身份需要各自取证，证据只留任务 ID、Key ID 和脱敏信息。只掌握画幅和时长时，分别用建单与完成窗口，检查请求规格和实际产物元数据，避免把窗口前建单、窗口内才完成的任务漏掉。
