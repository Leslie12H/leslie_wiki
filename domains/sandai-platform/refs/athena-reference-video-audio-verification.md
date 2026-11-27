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

**How to apply**　先查目标部署版本和模型 schema，再沿 [参考输入契约](https://github.com/world-sim-dev/athena-admin/blob/main/docs/architecture/i2fv-reference-inputs.md) 确认开关位置、PE 配置键、关开关时的素材准备和音频编号。固定同一模型、原始素材及提示词，按发布配置为每种开关状态配套选用对应的 PE，各建新 Job。用单有声视频和有声视频加独立音频两组覆盖，给同组的两种音源选可客观区分的轨道。

沿同一 Job 查 [准备与 PE 检查点](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/preprocessors/reference_prompt.py) 识别实际 PE 与 fallback，再用检查点的推理任务 ID 对齐真实派发的有序素材。对最终派发视频和音频读取轨道元数据，核对派生音轨来源、独立音频 URN 和提示词引用。需要验证重试时，按契约检查已准备 Job 的素材和编号复用。日志关联与具体音轨异常示例见 [Inference 并发资源看板查证入口](inference-concurrency-dashboard-entrypoints.md)。

## 从开放平台发起

**Why**　2026-11-27 从开放平台 Dev 验证时，入口拒绝了请求级 `options`，参考输入的规格校验和组织的模型访问校验也分别给出拒绝。Athena 已部署的参数与 PE 配置有独立的验证边界。

**How to apply**　先看 [Zeus v2 请求级选项解析](https://github.com/world-sim-dev/zeus/blob/dev/modules/generation-api/src/main/java/co/sandai/zeus/openapi/v2/generations/GenerationRequestOptions.java) 和目标部署的选项开关。若入口不接受该字段，沿 [Zeus 模型与变体选项合并](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/modelconfig/ModelOptionResolver.java) 回读匹配变体的 PE 与 `extra`，同时确认变体的参考输入、分辨率和测试组织对白名单的命中。两种开关值各新建任务，用平台 Task ID 找 Athena Job，回读最终派发的有序素材。

## Ark 建单前的音轨编码拒绝

**Why**　2026-11-27 核对 LibTV 的 Ark HTTP 400，`content[i].video_url.url` 和 `unsupported audio track codec` 来自 Zeus 参考素材导入的容器轨道校验。该校验在任务受理前执行。[Athena #873](https://github.com/world-sim-dev/athena-admin/pull/873) 与 [#880](https://github.com/world-sim-dev/athena-admin/pull/880) 只改变已受理任务的参考视频预处理与参数位置，保留内嵌音轨的设置不会跳过 Zeus 的入参校验。

**How to apply**　按 `validationReason=unsupported audio track codec`、Ark 创建路由和 `field=content[i].video_url.url` 查双区 Zeus SLS，以 `request_id` 去重，核对 HTTP 状态、组织和不存在的 `taskId`。双区检索失败时缩短扫描窗口，并用原始索引聚合核对覆盖。若已经有 Task ID，需另查 Athena 验证或派发失败。入口编码拒绝的检查和对照素材见 [媒体功能验收入口](media-functional-acceptance-entrypoints.md#2026-11-23-参考-mp4-音轨编码拒绝)，源码沿 [Zeus 轨道校验](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/domain/src/main/java/co/sandai/zeus/domain/asset/service/ReferenceMetadata.java#L155-L182) 与 [受理顺序](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/OpenApiGenerationService.java#L119-L135) 回查。对确认为不支持编码的文件，可保留视频流并把音轨转为 AAC，再按生产路径验收两个音轨模式。2026-11-27 统计查询及脱敏回执在 API 平台工作区 `.local/ark-reference-video-audio-20261127/`。

## 派发正确时仍需检查 PE 的声音引用

**Why**　2026-11-27 的 Dev 实验固定了开启模式所用 v7.1，再单独关闭内嵌音轨。这个组合用于观察错配表现。关闭内嵌音轨后，多视频与混合视频加独立音频的 WAV 产物、顺序和派发均正确，PE 改写仍把原声指向静音视频。单视频同组样本正确引用了拆轨。Fake Worker 的成功结果只能证明任务完成，不能回读真实模型是否采纳了声音指令。

**How to apply**　从开放平台 Task ID 按 `request_id` 对齐同环境 Athena Job。已授权的 Grafana 数据源 Athena Admin Dev 可只读回查检查点和有效输入，使用 `inference_task_id` 确认已发布。逐个校验有效产物，而后在 PE 原文里查声音语义对应的标签，区分用于画面描述的 Video 标签和误用于声音的 Video 标签。混合场景单独核对独立音频与拆出 WAV 的位置和身份。编号及开关口径回看 [Athena 参考输入契约](https://github.com/world-sim-dev/athena-admin/blob/main/docs/architecture/i2fv-reference-inputs.md)。当次 Dev 可回查 Job 15396 和 15397。

## 系统提示词必须与逐单声音映射一致

**Why**　2026-11-27 查明 Dev 固定 v7.1 实验中的声音引用。用户随后明确发布要求是开关与 PE 配套切换，该错配表现符合预期。该次 v7.1 系统提示词配置把所有视频的声音绑定写成内嵌音轨口径，和关闭时逐单消息给出的拆轨映射冲突。两条错误声音引用已存在于 PE 的原始 JSON，渲染和派发转换发生在其后。

**How to apply**　从 [系统提示词的实际取值](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/prompt_enhancement/enhance_v2/providers/base.py) 核对请求覆盖及动态配置键，再对照 [逐单素材消息](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/prompt_enhancement/enhance_v2/providers/gaga4_reference_enhance.py) 的角色、拆轨标签和输出处理分支。读取该次 Job 的 PE 产物查 `global_audio` 和镜头文本。默认 JSON 输出及现有编号范围检查都不具备静音视频作声音来源的语义校验。以 [输出契约和校验](https://github.com/world-sim-dev/athena-admin/tree/main/ApiService/prompt_enhancement/enhance_v2/reference) 回查当前行为。动态配置只保留键和当次 Job 指针，供按环境重新读取。

## 按发布组合验收

2026-11-27 用户确认音轨开关与 PE 配套切换。配置生效的验收以目标站点的配置组合、Job 实际 PE 结果、推理派发与音轨为准。当天 CN Staging 的开启组合通过单视频、双视频和视频加独立音频的派发核对，Job 指针为 5781369、5781382、5781386。用短提示词验证该组合时，先回读 PE 路由条件，避免误测同一个模型的其他 PE 路径。
