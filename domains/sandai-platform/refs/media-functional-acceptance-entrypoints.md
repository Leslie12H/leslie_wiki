---
name: sandai-api-platform-media-functional-acceptance-entrypoints
type: reference
created: 2026-11-14
updated: 2026-11-16
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

**长耗时成功样本（2026-11-16）：** 当公开任务显示处理中或调用端报告超时时，先沿 Zeus 的派发、Athena 工作器认领和完成、Zeus 最终状态对齐时间戳。工作器已认领后的耗时不能从共享队列指标反推。调用端超时窗口以调用端日志确认。国内单任务的时间线和独立回查见工作区 `.local/assets-v1-dual-production-20261116/timeout-871118079481541.EjROQO/RESULTS.md`。

**生产管理后台查退款（2026-11-16）：** 在 [Zeus 生产管理后台](https://zeus-admin.sandaii.cn/tasks)选择区域并用精确任务 ID 读取结算金额、币种、退款状态和原因。该视图读取任务结算表，等额退款事务可沿 [退款实现](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/domain/src/main/java/co/sandai/zeus/domain/credit/refund/TaskCreditRefundService.java#L302-L322) 核对。本次中美生产视频超限样本证据见 `.local/assets-v1-dual-production-20261116/video-boundary-refund.gei4Wa/RESULTS.md`。

**上游取消保留退款初始状态（2026-11-16 核对）：** 对原扣费仍存在且退款状态为 NONE 的 Canceled 任务，按 Zeus 任务号取得 Athena 作业号，沿取消路由 HTTP 回执、工作器的读取结果、Zeus 终态对时间线。用当时版本的调度状态映射和退款资格解释 NONE，调用方身份另查同一次取消的审计。证据见工作区 `.local/assets-v1-dual-production-20261116/refund-870450005409797.PNgNZU/RESULTS.md`。

## 10 图、3 视频、3 音频功能冒烟

**Why:** 上传和静态模板可证明素材可用、结构可编译。完整组合的生成准入、下游执行和结账要沿两套接口按真实任务 ID 核验。专项冒烟的素材有独立寿命，使用共享压测素材会使收敛在途与清理归属变得不确定。

**How to apply:** 复用 `postman/load/magi2/multimodal-case.mjs` 和固定素材 manifest，使用本批独立上传的资产。通过 `multimodal-smoke.mjs` 持久化上传、创建、删除意图及回执，按原接口读取终态、解码成片、查逐笔结算，再用原生删除和独立 GET 404 核对本批逻辑删除。未知创建回执时保全素材，未知删除回执时先 GET 再确定是否重试。实际回执沿本页生产报告的完整组合章节查询。共享预置素材的交接和物理存储处置仍需各自的证据。

## 参数规范修订后的生产回查

**Why:** 2026-11-14 的参数页在同一轮生产验收期间更新，已有回执对应旧版本；后台配置、网关实际路由和详情序列化可能各自滞后。已生成的同一成片可重查详情验证返回字段，成片本身的历史行为仍须用新任务验证修复。

**How to apply:** 用飞书当前 revision 与原始测试快照逐字段对照；改动枚举先查两区有效模型配置，再以当前 API 请求回执确认受理或拒绝。用已知任务比较文档列出的路由前缀与实际请求路径；对 Ark `duration` 同时记录请求秒数、响应值、视频流时长和容器时长。动态值与回执沿本页生产报告的「现行请求规范复核」查阅。

## 2026-11-16 中美生产 V1 Assets 独立上传准备

**Why:** 用户要求为两区生产的独立上传压测备齐图片、音频与视频。请求体包含文件及表单开销，按裸文件长度构造边界会测错拒绝条件。把预期 4xx 纳入容量错误率也会误判发压结果。

**How to apply:** 先重读[国内](https://platform.sandai.cn/docs/api-reference/)和[美国](https://platform.sand.ai/docs/api-reference/#upload-an-asset)当前文档、两区公开 OpenAPI 的 `/v1/assets` 请求体与响应 schema。按契约扩展名和大小分档准备正常容量素材，用固定长度的唯一文件名和编码后的 Content-Length 校验 multipart 边界。串行执行契约用例，单独记录网关与业务层拒绝。文件本身触线时请求体已超限，单条请求无法区分两道阈值。生产上传回执不明时以本轮组织、文件名、哈希和 Request ID 查证，保留原回执。正式走区域发压 Pod 前重查 kubeconfig 证书有效期、运行器闲忙及真实遥测。

- 工作区入口 `postman/load/assets-v1/README.md`，当次清单和离线校验见 `.local/assets-v1-dual-production-20261116/`。[本次执行上下文](https://chatgpt.com/codex/threads/01a1e238-0202-7422-aa74-ab277f0b1d06)。

### 当日更正：验收以指定飞书上传附件为准

**Why:** 2026-11-16 用户指定[开放平台 API 文档（国内）](https://j0yswlgboxz.feishu.cn/wiki/QzRzwbeZiikxO7kPIH0cd5XSnvf)用于中美独立上传测试。其中「上传素材」的 Markdown 附件明确是 V1 multipart，规格与公开网页冲突。不能据公开页或旧 V2 大文件回执推断当前 V1 的实际响应。

**How to apply:** 读最新飞书 revision 并另外读取内嵌附件，按指定文档冻结预期。单文件上限和更大的完整表单上限分别构造，在保留单个 file 部件时用 MIME 前导区跨表单边界。大文件用流式发送，核验真实 Content-Length。实际路由、文件是否成功和部署差异以本轮回执复核，附证据纪录入口仍见上节。

### 2026-11-16 生产 V1 上传冒烟回执

**Why:** 中美生产的同一 V1 路径对飞书上限内的视频返回了不同的业务错误。顶部边界样本的拒绝码吻合，只证明该样本被拒绝。判断契约达标还需要上限内样本有真实 200 和资产 ID。

**How to apply:** 逐区域固定 endpoint、组织及素材 SHA，分别记录文件大小、完整表单大小、HTTP、业务 code、Request ID 和资产 ID。用普通视频对照上传成功，区分大小拒绝和媒体校验拒绝。定位实际阈值时让裸文件处于候选阈值以内，同时改变完整表单长度。5xx 无资产 ID 保留为未知，按准确组织、唯一文件名及 Request ID 对账。具体生产回执和当次决策见工作区 `.local/assets-v1-dual-production-20261116/production-smoke-evidence-20261116/`。

### 同日复测与上限附近的受理波动

**Why:** 后续复测读取了更高文档 revision，再核对上传附件哈希，确认验收字节阈值保持一致。相同贴线文件曾在一次请求被拒、另一次请求形成真实资产，单点结果不足以给出稳定的容量判断。本机向不同地域上传大文件时，客户端超时也会造成缺少 HTTP 和 Request ID 的回执。

**How to apply:** 比对同一素材 SHA、裸文件字节、实际 multipart 字节、HTTP 和具体 ID。对成功回执用原组织读取精确资产 ID，区分上传返回和独立回查。慢传输可为尚未发送的用例调整客户端等待时间，已发且无回执的请求继续标记未知。同日第二轮预期、原始台账和回查在 `.local/assets-v1-dual-production-20261116/round2-check.rPwAUe/`。[执行上下文](https://chatgpt.com/codex/threads/01a1e238-0202-7422-aa74-ab277f0b1d06)。

**国内基础格式补跑：** 用户要求完成全部用例后，按冻结矩阵减去已有回执，剩余用例用独立测试组织逐项执行。保留先前的未知回执，覆盖完成与业务通过分别核算。合并后的回执及未确认受理项见上述第二轮目录的 `RESULTS.md`。

### 2026-11-16 上海 V1 素材注册 HTTP/1.1 EOF

**Why:** 同一镜像在两地可以通过不同入口访问 Athena。上海 V1 冒烟的跨格式 500 和两条大视频 00202 在实际日志中都落在注册阶段的响应头 EOF。视频处理可能两次注册，海报失败可以被映射为素材内容无效并删除原资产。暂存删除告警也出现在成功样本，不能仅凭它给响应错误归因。

**How to apply:** 以当次同 SHA 部署回执和政策确认两区实际路线，用 Request ID 查 Zeus 阶段及 Trace ID，再与 Athena 注册访问日志和 ARMS 比对。先区分初次注册、实际对象 PUT 和视频海报注册。服务器分配的资产 ID 用原组织 GET 对账。无响应头时保留请求是否已被 Athena 处理的不确定性，区分 HTTP/1.1 EOF 与[历史 HTTP/2 异常](../pitfalls/asset-registration-http2-failures.md)。此次证据与仍未知的关闭连接组件见工作区 `.local/assets-v1-dual-production-20261116/root-cause-20261116/RESULTS.md`。

### 2026-11-16 美国 V1 WAV 时长上限

**Why:** 实际生产错误码与文档这一条媒体时长规则的预期不一致。边界接受行为和响应契约各自验收。

**How to apply:** 同一区和组织使用相同编码的 WAV，以实际解码时长生成低于、等于、超过上限的三份文件，字节量留足余量。逐条记录 HTTP、业务码及资产 ID。必要时对照部署代码中媒体时长校验的异常类型和公开错误映射。契约回查以上述飞书上传附件为准，原始回执及分钟窗口见工作区 `.local/assets-v1-dual-production-20261116/us-audio-duration.Fnm46A/RESULTS.md`。

### 2026-11-16 美国视频单段及音视频累计时长

**Why:** 同一批素材可能逐个通过 V1，同时在 V2 的 Athena 累计时长预处理失败。创建回执只表示受理，公开生成错误可能隐去触发的媒体类型与时长阈值。本轮定位到音频累计阈值与飞书规范不一致。

**How to apply:** 对单段分别取低于、等于、超过文档上限的实际流时长。累计用例固定前两段，改变第三段，保证各段独立合规，并以本区同组织的上传 ID 组装 V2 请求。用同一任务查询终态，沿 Zeus 的任务 ID 到 Athena 作业 ID 关联预处理错误，区分累计拒绝与其他生成失败。按日期回查工作区 `.local/assets-v1-dual-production-20261116/us-cumulative-duration.rmbEUv/RESULTS.md`、精确回执和日志，契约以指定飞书文档的对应附件为准。

**三段参考音频累计阈值复测（2026-11-16）：** 上一轮在第二段累计 20 秒处触发拦截，不能从该样本确定等号行为。本次用同样的模型、组织和 `assetId` 入口，保持前两段相同并精确裁剪第三段，通过创建、终态查询及 Athena 关联日志确定边界。回执见工作区 `.local/assets-v1-dual-production-20261116/us-audio-total-15.pRUqs1/RESULTS.md`。

**Athena 累计阈值的来源（2026-11-16 核对）：** 对照 [Seedance 兜底校验 PR #800](https://github.com/world-sim-dev/athena-admin/pull/800) 与 [Magi-2 对齐 PR #809](https://github.com/world-sim-dev/athena-admin/pull/809)。前者引入音视频分别累计、共用上限的预处理规则。后者对齐了单段时长，并在当时约束仍在讨论时明确沿用累计规则。用 [阈值定义](https://github.com/world-sim-dev/athena-admin/blob/6807680c6f18a3aa8868959e10fae4b98c896d9c/ApiService/validators/reference.py#L17-L20) 和 [累计校验](https://github.com/world-sim-dev/athena-admin/blob/6807680c6f18a3aa8868959e10fae4b98c896d9c/ApiService/preprocessors/reference_prompt.py#L141-L158) 对照生产拒绝。已上传的 `assetId` 不参与 Zeus 的 [本次 URL 导入累计校验](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/GenerationMedia.java#L89-L101)，复测需查预处理和最终状态。

**Athena 修复后复测（2026-11-16）：** 对照 [PR #822](https://github.com/world-sim-dev/athena-admin/pull/822)，复用旧失败用例的原始请求体与已有资产 ID，跟踪同一公开任务至 Athena 预处理和生成回执。美国生产实际回执见工作区 `.local/assets-v1-dual-production-20261116/us-audio-total-30-recheck.LgahUq/RESULTS.md`。

**修复后超限对照（2026-11-16）：** 保留两段素材，只替换第三段做最小超限复测。创建受理后沿 Zeus、Athena 和最终回执核实累计校验与公开错误码。美国生产证据见工作区 `.local/assets-v1-dual-production-20261116/us-audio-total-30p01-recheck.CTnXBG/RESULTS.md`。

**国内生产对照（2026-11-16）：** 将美国复测的相同 WAV 字节上传至国内测试组织，验证 SHA 与时长，再用国内同组织资产 ID 分别跑触线和超限用例。通过 Zeus 与 Athena 的作业关联确认发生阶段，生成回执与素材证据见工作区 `.local/assets-v1-dual-production-20261116/cn-audio-total-30-boundary.FZzSVe/RESULTS.md`。

**视频累计中美回归（2026-11-16）：** 对照同一批视频字节，固定前两段，只替换第三段，比较两个区域的公开回执和 Athena 预处理记录。用此前美国资产及新上传的国内同组织资产，检验音频累计规则拆分后的视频边界。证据见工作区 `.local/assets-v1-dual-production-20261116/dual-video-total-15-boundary.2o4Kb4/RESULTS.md`。
