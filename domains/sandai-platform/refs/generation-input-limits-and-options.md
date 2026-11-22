---
name: sandai-platform-generation-input-limits-and-options
type: reference
created: 2026-11-21
updated: 2026-11-22
tags: [sandai, openapi, staging, generation, validation]
links: [sandai-api-platform-v2-input-validation-entrypoints, sandai-api-platform-development-entrypoints]
---

# 生成输入限制与请求覆盖查证入口

**Why:** 2026-11-21 为 Zeus PR #518 准备 staging 验收。环境阈值与单请求覆盖可以独立变化，素材上传受理和原始对象可读也需要分别核验。

**How to apply:** 核对服务部署 SHA，再从该环境的 OpenAPI Schema 和 Playground `/api/v1/platform/models` 取有效阈值。沿 PR 的部署说明回查公共配置和 OpenAPI 角色开关。覆盖权限使用同一国内 staging 的普通组织 Key 与内部 Key 做对照。按来源分别测试新导入 HTTPS 素材、已有 asset ID、方舟 Base64 和独立上传。累计时长优先使用可读外链，避免把仅在异步预处理才检查的已有素材结果当成同步入口验证。遇到签名下载失败时，保留素材 ID 回执与对象下载证据。

验证环境阈值时，分轮隔离数量、字节数和时长。先用素材清单核对非目标阈值有余量，尤其要排除音视频字节上限先于时长检查触发。总项数边界用例把超额素材放在最后，避免逐项解析先触发单类型数量限制。

- 实现与配置查证：[Zeus PR #518](https://github.com/world-sim-dev/zeus/pull/518)及关联部署工作流。
- 2026-11-21 用例、素材和读回证据入口：`/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr518-staging-20261121/README.md`。阈值、资产回读和验收状态沿该入口重新核验。

## 2026-11-21 海外 staging 分轮实测

**Why:** 同一条输入限制在模型目录回读成功后，还需验证对应请求路径。MP4 带 `edts` 编辑列表时，Zeus 同步探测可能不给出可靠时长。滚动替换期间，部署界面就绪与请求命中新配置可能短暂错开。

**How to apply:** 用 ACK 工作负载的「更多 → 重新部署」同镜像重建相关角色，新 Pod 就绪后继续回读 Swagger、模型目录及实际验证结果。验证 `options` 关闭时，使用启用状态也会拒绝的非法字段，按字段错误区分开关，避免切换期间意外创建任务。测视频时长应分别覆盖有编辑列表与可识别时长的文件。只提供纯文本 fake 时，累计时长只能回读生效值，保留实际多段生成的验收缺口。

- 本地配置与 API 回执：`/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr518-staging-20261121/staging-global-run/RESULTS.md`。沿相邻只读回执核对恢复状态和补测素材。

## 2026-11-21 `generateAudio` 成片音轨查证

**Why:** Zeus 的提交和成功状态只证明任务完成。`generateAudio=false` 是否对用户生效，需要检查查询接口实际交付的文件容器流。Athena #819 的静音后处理依赖最终派发目标支持后处理交接，Zeus #519 的选择依赖成功回调中的已确认产物。

**How to apply:** 核对当前 Magi 环境的 Zeus 和 Athena 部署后，用同模型、同输入和种子，仅改变 `generateAudio` 跑正反对照。两条都从各自任务详情下载最终交付视频，使用 `ffprobe` 检查视频流和音频流，必要时用 `volumedetect` 确认开启对照确有信号。涉及水印或不同执行端时分别复验。

- [Zeus #519](https://github.com/world-sim-dev/zeus/pull/519) · [Athena #819](https://github.com/world-sim-dev/athena-admin/pull/819)
- 海外与国内环境分开取证。本次 `staging-cn` 自有 v2 `magi-2` A/B 的请求、成片流和终态见 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr519-audio-20261121/RESULTS.md`。

## 2026-11-21 方舟兼容入口分区回读

先用兼容路径的鉴权响应定位入口，再用有效 Key 完成创建与查询闭环。验证两区提示词阈值不同，可以给同一超默认上限的提示词设置一个下游必定拒绝的时长，读取返回的参数名判断是否通过前面的长度校验，全程避免创建长提示词生成任务。方舟请求字段是 `generate_audio`，最终音轨沿 `content.video_url` 查证。

- 海外与国内方舟入口、代表性阈值、默认音频及静音成片证据见 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr519-ark-20261121/RESULTS.md`。

## 2026-11-21 国内生产无声反馈取证

**Why**　模型输入里写有音效或音乐，最终交付仍可能静音。方舟的 `generate_audio` 控制交付音轨，Athena 在 GPU 返回原片后按任务配置决定是否去音轨。

**How to apply**　先按 OpenAPI 任务 ID 查创建路由、实际接单 Pod 和 Dispatcher 关联的 Athena Job ID。再查该 Job 的 `processor_type=post_remove_audio` 及终态，并对齐实际接单和交付两个角色的发布版本。Athena 的 `postprocessor published` 表示已下发。是否完成应核对 Job 步骤状态，或核对当时交付代码是否要求成功的处理步骤及其产物。需要验证实际听感时，分别检查推理原片和该任务查询接口交付的 MP4，用 `ffprobe` 检查音轨，用 `volumedetect` 核对有轨文件的信号。参数未直读时写明它是从执行链路推定的值。

- 生产样本的查证锚点是 OpenAPI 任务 `872957884154373`、Athena Job `4518090`、去音轨处理器 `b8d3b434`。在上海 SLS 查询 2026-11-21 19:34–19:53（北京时间），沿任务提交、原片交接、处理器下发和成功终态查证。原始 HTTP 请求体和最终下载 MP4 未直接读回。 [Zeus 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/co_sandai_zeus_prod?slsRegion=cn-shanghai) · [Athena 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/inference-prod?slsRegion=cn-shanghai)
- 当次接单发生在生产滚动发布中。用发布回执里的 Pod 名和镜像核对逐角色的版本，再检查原请求解析中省略字段的默认值和新版静音产物选择条件。 [方舟请求解析](https://github.com/world-sim-dev/zeus/blob/51b97abc89c633a5b4d6ef42678b6afc69a44bc9/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkGenerationRequest.java#L158-L172) · [Zeus 国内生产发布](https://github.com/world-sim-dev/zeus/actions/runs/44899239152) · [Zeus 成片选择逻辑](https://github.com/world-sim-dev/zeus/blob/f04eae7afef28dd3941d9a2ff18ffffff0c52782/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/AthenaVideoDelivery.java#L73-L131)

## 2026-11-22 双区生产输入配置查证

**Why**　发布回执能定位配置功能进入哪个工作负载。公开 Schema 能回读参考素材数量，单文件字节数和时长则需要查模型目录或运行配置。

**How to apply**　核对国内与美国的 OpenAPI 发布回执及镜像版本，再分别只读请求生产 `/openapi.json`。检查 `CreateGenerationV2Request.properties.parts` 的 `maxItems` 和描述中各类素材数量，PR #518 起由环境输入配置生成。单文件大小、单段时长与各类累计时长回查已登录的模型目录和相应 Pod 配置。请求级 `options` 即使开启也从公开 Schema 隐藏，开关需回查部署配置。提高素材阈值时同时核对网关请求大小和 Athena 预处理限制。

- [国内生产部署](https://github.com/world-sim-dev/zeus/actions/runs/44899239152) · [美国生产部署](https://github.com/world-sim-dev/zeus/actions/runs/44898513686) · [国内生产 Schema](https://api.sandai.cn/openapi.json) · [美国生产 Schema](https://api.sand.ai/openapi.json)

## 2026-11-22 模型变体与参考素材阈值

**Why**　Playground 在模型目录同时返回模型能力与素材阈值，两类字段来自不同配置。生成请求的 `duration` 表示成片时长。

**How to apply**　查后台模型配置时，用 `ModelVariant` 和 `ModelVariantSelector` 核对 `sourceType`、成片规格及实际 Athena 路由。查参考素材阈值时，沿 `GenerationInputLimits` 与环境 ConfigMap 核对。Playground 模型目录的顶层 `mediaLimits` 来自环境配置，各模型的 `inputSchema` 结合环境阈值和模型变体生成。需要只给单个模型改素材数量、字节或时长时，先核对 Zeus 对模型字段的实际读取，当前模型变体无这组阈值配置。

- [后台模型配置契约](https://github.com/world-sim-dev/zeus/blob/f04eae7afef28dd3941d9a2ff18ffffff0c52782/docs/admin-api.md#模型配置与白名单) · [Playground 模型目录](https://github.com/world-sim-dev/zeus/blob/f04eae7afef28dd3941d9a2ff18ffffff0c52782/modules/api/src/main/java/co/sandai/zeus/api/platform/generation/PlaygroundModelCatalog.java#L20-L64)

## 2026-11-22 参考素材数量与 Athena 提示词增强

**Why**　Zeus 的环境配置和 Athena 参考素材提示词增强的 Job 校验分别读取数量上限。Zeus 放宽后，通过入口校验的请求仍可能触发 Athena 的单类型或总数校验。

**How to apply**　修改生产素材数量前，按 Athena API Service 的生产发布 SHA 检查 `validate_reference_request` 的启用条件、`REFERENCE_INPUT_COUNT_LIMITS` 和 `REFERENCE_INPUT_TOTAL_LIMIT`。总数按参考素材计，Zeus 的 `parts` 或方舟 `content` 还包含一个文本项。在 staging 用真实模型覆盖开启参考素材提示词增强时的目标组合与各上限加一，分别核对请求受理、Athena 预处理和成片。生产待审批配置和实际生效值以当次变更回执为准。

- [Athena 生产 API Service 发布回执](https://github.com/world-sim-dev/athena-admin/actions/runs/44927826060) · [该发布版本的参考素材校验](https://github.com/world-sim-dev/athena-admin/blob/c912bb99586de9b0e8afff027c4a4e2b74281390/ApiService/validators/reference.py#L7-L65)

Athena [#809](https://github.com/world-sim-dev/athena-admin/pull/809) 是数量上限的历史来源。建单调用 `validate_reference_request`，参考 PE 的输出协议开关由 [#840](https://github.com/world-sim-dev/athena-admin/pull/840) 管理。按 [#826](https://github.com/world-sim-dev/athena-admin/pull/826) 关闭增强会跳过这段数量分支，参考素材仍走 [#823](https://github.com/world-sim-dev/athena-admin/pull/823) 抽出的格式、字节和时长预处理。可单独离线调用生产版本的校验函数复核当前上限、单类型超限、完整组合和 PE 开关，再用真实任务覆盖后续阶段。
