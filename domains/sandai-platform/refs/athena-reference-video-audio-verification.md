---
name: athena-reference-video-audio-verification
type: reference
created: 2026-11-27
updated: 2026-11-27
tags: [sandai, athena, reference-video, prompt-enhancement, testing]
links: [inference-concurrency-dashboard-entrypoints]
---

# Athena 参考视频音轨的派发验收

**Why**　2026-11-27 为 [Athena #880](https://github.com/world-sim-dev/athena-admin/pull/880) 准备 Dev 用例。参考视频的音轨可以随视频派发，也可以作为额外的 WAV 派发。独立上传音频与视频拆出的音频来源不同。仅比较派发素材总数或查看任务原始素材，无法确认声音来源及编号。

**How to apply**　先查目标部署版本和模型 schema，再沿 [参考输入契约](https://github.com/world-sim-dev/athena-admin/blob/main/docs/architecture/i2fv-reference-inputs.md) 确认开关位置、PE 配置键、关开关时的素材准备和音频编号。固定同一模型、PE、原始素材及提示词，开关两组各建新 Job。用单有声视频和有声视频加独立音频两组覆盖，给同组的两种音源选可客观区分的轨道。

沿同一 Job 查 [准备与 PE 检查点](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/preprocessors/reference_prompt.py) 识别实际 PE 与 fallback，再用检查点的推理任务 ID 对齐真实派发的有序素材。对最终派发视频和音频读取轨道元数据，核对派生音轨来源、独立音频 URN 和提示词引用。需要验证重试时，按契约检查已准备 Job 的素材和编号复用。日志关联与具体音轨异常示例见 [Inference 并发资源看板查证入口](inference-concurrency-dashboard-entrypoints.md)。

## 从开放平台发起

**Why**　2026-11-27 从开放平台 Dev 验证时，入口拒绝了请求级 `options`，参考输入的规格校验和组织的模型访问校验也分别给出拒绝。Athena 已部署的参数与 PE 配置有独立的验证边界。

**How to apply**　先看 [Zeus v2 请求级选项解析](https://github.com/world-sim-dev/zeus/blob/dev/modules/generation-api/src/main/java/co/sandai/zeus/openapi/v2/generations/GenerationRequestOptions.java) 和目标部署的选项开关。若入口不接受该字段，沿 [Zeus 模型与变体选项合并](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/modelconfig/ModelOptionResolver.java) 回读匹配变体的 PE 与 `extra`，同时确认变体的参考输入、分辨率和测试组织对白名单的命中。两种开关值各新建任务，用平台 Task ID 找 Athena Job，回读最终派发的有序素材。
