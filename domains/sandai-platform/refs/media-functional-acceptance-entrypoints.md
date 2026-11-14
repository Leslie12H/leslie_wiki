---
name: sandai-api-platform-media-functional-acceptance-entrypoints
type: reference
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, api-platform, media, functional-testing, openapi]
links: [sandai-api-platform-v2-input-validation-entrypoints, sandai-api-platform-performance-testing-entrypoints]
---

# 开放平台多媒体功能验收入口

**Why:** 2026-11-14 用户要求为图片、音频和视频准备各格式及阈值素材，供功能验收。旧版上传和 Magi 多模态参考接入的文件限制、媒体类型和校验阶段存在差异。单个素材的结果需要落实到具体入口、协议版本和生成终态。

- 契约入口：[开放平台视频生成 API 参数说明](https://j0yswlgboxz.feishu.cn/wiki/BOG6wZQpjiQ9lJk0jf7c91LBnyl)、[公开上传参考](https://platform.sand.ai/docs/api-reference/#upload-an-asset)、Zeus `docs/openapi-v2-generations.md`。确认目标环境实际部署的路径、原生结构及 Ark 兼容状态。
- 源码查证：Zeus `PlatformAssetController`、`LegacyAssetUpload` 和 `FFmpegHelper` 对应通用素材上传；`ReferenceAssetController`、`ReferenceMedia`、`ReferenceMetadata`、`ImageAssetImporter`、`GenerationMedia` 对应参考上传和生成。若输入校验与部署链路有差异，记录接受或拒绝发生的阶段，并查询任务终态。
- [素材包与用例所在 Codex 对话](https://chatgpt.com/codex/threads/01a1d8d0-8c94-7523-95ea-8263a990e1d5)。本地交付目录为 `/Users/leslie/.codex/visualizations/2026/11/14/01a1d8d0-8c94-7523-95ea-8263a990e1d5/`。CSV 记录精确字节、解码结果、素材与用例映射和接口预期，ZIP 保留媒体实物。

**How to apply:** 对 multipart 完整请求固定 boundary、filename 和 MIME 以构造阈值上下各一字节的可重复请求。对原始二进制入口按实体字节构造合法媒体容器，验证可解码及独立的尺寸、时长、数量和累计时长。对延后预检通过的素材同时记录上传 ID、生成终态、结果规格与账务；离线解码仅作为素材证据。

## 2026-11-14 生产参数边界取证

**Why:** 用户将验收环境改为生产，并指定模型 `magi-2-1114`。接口受理、Athena 等待、成片交付和账务结算分别取证。大文件超限返回与上传阶段的依赖失败有不同的复测依据。

- 逐条结果、覆盖矩阵与分批状态在工作区 `.local/magi2-boundary-acceptance-20261114/production-report.md`、`production-case-results.csv`、`production-coverage.csv`。以相邻生产回执、模型只读回查、任务账本和上传服务日志为原件。Dev 的接口对照与生产目标模型各有单独记录。
- 执行环境与模型权限沿[双区原生与 Ark 冒烟入口](dual-region-native-ark-smoke-entrypoints.md)再次核对。对比同一区域的实际配置与飞书参数版本，记录范围和枚举的差异。保留每次请求的存储及下游状态证据。

**How to apply:** 已受理任务用原 ID 续查。公开 processing/running 长时间无变化时，按同一请求记录对照 Zeus 派发状态及 Athena 按请求号回读。前一批还在下游等待时，保持约定的批次边界。文件大小测试同时留存精确字节、客户端响应、服务端阶段及精确资产回读。部分输入预检通过后可能在生成中被拒绝，复测需覆盖该阶段与退款。

## 下游排队与账务续查

**Why:** 本轮通过相同任务的 Zeus 公开查询、Athena 按请求号查询和同模型队列指标，区分了接口处理中和下游 pending。单条任务的接口状态无法反映共享队列规模，队列总量也无法给出该任务的排位或完成时间。

**How to apply:** 先用 Athena 实际路由的模型名筛选 `inference-queue-exporter` 的 `athena_inference_queue_pending`，核对 broker、db 和 priority，结合多个时点看趋势。再用原任务 ID 查终态产物，并按精确任务 ID 核对预扣、退款和终态入账。共享测试组织还有其他任务时，用逐任务账本归因金额，余额用于复核批次。监控和续跑证据沿本页生产报告及同目录的 `production-first-watch.jsonl`、`production-batch-billing.jsonl` 查询。

## 10 图、3 视频、3 音频功能冒烟

**Why:** 上传和静态模板可证明素材可用、结构可编译。完整组合的生成准入、下游执行和结账要沿两套接口按真实任务 ID 核验。专项冒烟的素材有独立寿命，使用共享压测素材会使收敛在途与清理归属变得不确定。

**How to apply:** 复用 `postman/load/magi2/multimodal-case.mjs` 和固定素材 manifest，使用本批独立上传的资产。通过 `multimodal-smoke.mjs` 持久化上传、创建、删除意图及回执，按原接口读取终态、解码成片、查逐笔结算，再用原生删除和独立 GET 404 核对本批逻辑删除。未知创建回执时保全素材，未知删除回执时先 GET 再确定是否重试。实际回执沿本页生产报告的完整组合章节查询。共享预置素材的交接和物理存储处置仍需各自的证据。

## 参数规范修订后的生产回查

**Why:** 2026-11-14 的参数页在同一轮生产验收期间更新，已有回执对应旧版本；后台配置、网关实际路由和详情序列化可能各自滞后。已生成的同一成片可重查详情验证返回字段，成片本身的历史行为仍须用新任务验证修复。

**How to apply:** 用飞书当前 revision 与原始测试快照逐字段对照；改动枚举先查两区有效模型配置，再以当前 API 请求回执确认受理或拒绝。用已知任务比较文档列出的路由前缀与实际请求路径；对 Ark `duration` 同时记录请求秒数、响应值、视频流时长和容器时长。动态值与回执沿本页生产报告的「现行请求规范复核」查阅。
