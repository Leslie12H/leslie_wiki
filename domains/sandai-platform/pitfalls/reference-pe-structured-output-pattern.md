---
name: sandai-api-platform-reference-pe-structured-output-pattern
type: pitfall
created: 2026-11-17
updated: 2026-11-19
tags: [sandai, api-platform, athena, reference-pe, structured-output]
links: [sandai-api-platform-inline-load-admission-and-discovery, sandai-platform-production-error-alerts-entrypoints, vidmuse-access-log-entrypoints]
---

# Reference PE 的结构化输出与本地值校验

**Why:** 2026-11-16 上海 Ark inline 压测的一条请求创建成功，最终在 Athena Reference PE 失败。模型的第二次响应把带空格的自由文本写入 `entity_id`。Athena 发给模型的结构化输出 Schema 将该字段投影为字符串，完整 Schema 的正则由 Athena 收到模型输出后执行。HTTP 200 可以同时出现在模型请求和 Ark 创建回执中，仍需检查各层的业务终态。

**How to apply:** 用 Zeus task ID 找创建 Request ID、trace 与 Athena Job ID。用 task ID 和 Request ID 对上 runner 台账，再比对请求体哈希，确认是否本轮压测及使用的正文。通过 Job ID 查 `inference-prod` 中两个 PE 尝试的 `category`、最终异常与 worker 镜像；核对镜像对应的 provider 及两套 Schema。若日志只保留校验路径和值，原始模型 JSON、首轮校验细项和具体是哪张图触发的描述仍需单独取证。

- [2026-11-16 预处理生产发布](https://github.com/world-sim-dev/athena-admin/actions/runs/43824041900)
- [Provider 响应与重试](https://github.com/world-sim-dev/athena-admin/blob/002eac3448bb89a207773089289ac7524cf5a942/ApiService/prompt_enhancement/enhance_v2/providers/gaga4_reference_enhance.py#L130)
- [结构化输出 Schema 投影](https://github.com/world-sim-dev/athena-admin/blob/002eac3448bb89a207773089289ac7524cf5a942/ApiService/prompt_enhancement/enhance_v2/reference/schema.py#L6)
- [完整 Schema](https://github.com/world-sim-dev/athena-admin/blob/002eac3448bb89a207773089289ac7524cf5a942/ApiService/prompt_enhancement/enhance_v2/reference/schema.v1.json#L88)

## Beta CN 画布的业务终态（2026-11-19）

**Why:** 画布的通用生成失败文案可来自 Athena 提示词增强。Zeus 将这类预处理失败归入 `EXECUTION`。内容审核和参考素材校验可能已经通过，推理尚未开始。这次现场看到 Reference PE 返回未注册的 `scene_ref` 和无效的素材占位符，Athena 在校验输出时结束任务。

**How to apply:** 通过 [VidMuse 生成日志入口](../../vidmuse/refs/access-log-entrypoints.md) 核对 AION 实际访问的 OpenAPI 环境和组织，再用已返回的生成 ID 查派发 Job。按 Job ID 搜上海 `inference-prod` 的 `preprocess-worker` 日志，读取 `pp_prompt_enhancement` 的最终状态和 `Reference PE response violates its protocol` 的字段路径。Celery 的 `Task ... succeeded` 表示处理函数返回，业务终态以 Job 状态为准。若需核实模型生成了什么或素材如何映射，另查对应请求与原始 PE 输出。

- 本次证据见 Apipltform 工作区 `.local/beta-cn-magi2-failures-20261119/` 下的 `exact.json` 和 `worker-reasons.json`。
