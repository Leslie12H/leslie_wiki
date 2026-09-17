---
name: monitoring-report-vs-chat-output
type: pitfall
created: 2026-09-16
updated: 2026-09-17
tags: [vidmuse, admin, monitoring, maxwell, structured-output]
links: [monitoring-problem-title-vs-incident-report, monitoring-code-scope-blocks-claim]
---

# 监控机器报告与聊天正文的分离边界

**Why:** 2026-09-16 只读核验目标 Maxwell Preset `8e049ce9-bba9-41cf-a98e-f357504e2e50` 的在线开关、Prompt 和会话，确认开启 Structured Output，Prompt V4 禁止 Markdown，最终聊天直接展示诊断 JSON。核对时主干 Admin Gateway 仍取当前 Run 最后 `agent.content.text` 做报告校验。只关闭开关可能仍输出 JSON；同时改为纯 Markdown 则会破坏机器报告读取。后续实现及验证状态见下方配套 PR；代码验证不代表已部署或验证生产回填。

**How to apply:**

- 重新核对在线 Preset、Prompt、Skill 和 Admin 每轮投递指令四处约束，不从单个开关推断真实输出。切换应同时版本化资源源文件与在线绑定。
- 查 `apps/admin/service/maxwell_runtime_gateway.py` 的 `_report_from_events`、`_message_content`、`_hydrate_tool_result_references`，以及 `monitoring_incident_report_validation_v2.py`、`monitoring_incident_notification.py`。当前主线快照：Admin `21764138ad9e70c7105d1c0447559a6223d1c79e`；部署版本另查。
- 分离方式：Monitoring MCP 提供纯函数报告准备工具，Runtime 保存完整工具结果，Admin 读取报告后继续原 Schema/证据校验和回填，聊天最终为 Markdown。工具及消费者实现见配套 PR，不从本页推断部署状态。报告准备成功不等于 Admin 采纳。
- MCP 报告工具必须与证据 Connector 分开，不给模型报告生成 evi_/rec_，不计入证据完成度。查 `internal/server/server.go`、`tools.go`，快照 `2a3389fe11e448bface2aaea7d0063c34cc8e98b`。
- Admin 解引用目前按证据工具名单过滤，报告工具需独立 allowlist。必须取完整 role:tool owner 正文并核对 Run/Thread/call/ref/hash/size；preview 和调用参数不能代替结果。
- 容量不能只看业务报告上限：上述快照 Admin 报告上限为 64 KiB，MCP 生产证据响应为 48 KiB；重新检查配置，给报告封装单独有限预算，不全局放宽证据工具。
- 新旧报告传输协议固化到派发/重试记录；旧 JSON Run 继续原回收，新协议缺报告应明确失败。保持终态门禁、generation/CAS、防重复回填及通知去重。晚到旧 Run 不覆盖新结论。
- 失败的准备参数应允许后续合法修正；但更早启动的慢重放不能掩盖后来失败的更正。新协议强制完整 resultRef owner；旧证据 inline 兼容不能成为新报告绕过来源检查的入口。
- Maxwell 原生模型虽使用 parts，Admin 所用 Runtime HTTP events 接口仍经 `legacyEventPage` 投影为 content。遇到契约差异先追到 Controller 的真实序列化路径，不仅凭领域模型加 fallback；当前实现见 `services/agent-server/internal/modules/runtime/transport/http/legacy_message.go`。
- Maxwell `structuredoutput/middleware.go` 负责 JSON 提示、规范化和修复，不校验 Incident 业务 Schema；当前 `8141d9fbafafd5b5e9345d43eeead5072d60d218` 的 A2A JSON MIME 也不会把 Markdown 转为诊断对象。
- 验收必须包含聊天流式/重载、完整报告、证据拒绝、旧 Run、幂等、容量和实际测试卡片。不要将“方案兼容”表述为“线上卡片已验证”。历史 JSON 不会因关闭开关自动改变。
- 脱敏检查要与真实传输规则一致，并保留已经脱敏的多行原文。对 canonical JSON 整串套用非幂等正则，可能吞掉 `[REDACTED]` 后的换行转义；Admin 精确引用要求使模型不能靠改写观察值修复。
- 手工指定 Run 补建投递回执也是传输协议入口；必须从目标 Run 的 canonical context 核对协议和 binding。未知协议不能默认 legacy，也不能套用当前世代 payload。
- 手工恢复要把只读预检已经验证的完整 receipt 传到写入步骤，并按指定 Run 固定后续选取；历史 receipt ledger 可以属于旧线程，不能仅用当前 Incident 线程比较代替可信历史匹配。严格恢复与显式历史降级投影保持独立边界。
- 已脱敏 marker 后允许合法分隔或 JSON 分隔转义时，应保留原文；不能无条件按 HasPrefix 豁免整段。每个凭据前缀均独立扫描，并检查 marker 后的边界，防止直接后缀或 literal 转义藏住另一段真实凭据。PR #64 的 review thread 与正式拒绝回归是此边界的追溯入口。
- 两端容量上限必须计算同一层：裸 MCP envelope 与 Runtime status/content 包装后的字符串字节数不同，边界回归要走完整封装。

## 追溯入口

- [Admin 报告传输与切换说明 PR #883](https://github.com/world-sim-dev/vidmuse-admin/pull/883)、[Monitoring MCP 报告工具与资源 PR #64](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/64)。合并、CI 和部署状态重新从 PR / workflow 查询。
- [Admin Gateway](https://github.com/world-sim-dev/vidmuse-admin/blob/21764138ad9e70c7105d1c0447559a6223d1c79e/apps/admin/service/maxwell_runtime_gateway.py#L1504)
- [Maxwell Structured Output](https://github.com/world-sim-dev/maxwell-ai/blob/8141d9fbafafd5b5e9345d43eeead5072d60d218/services/agent-server/internal/modules/runtime/extensions/structuredoutput/middleware.go#L16)
- [MCP 证据分发](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/blob/2a3389fe11e448bface2aaea7d0063c34cc8e98b/internal/server/server.go#L719)
- 本地可评审方案：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/monitoring-preset-readable-output-plan-20260916.md`。
- 2026-09-16 独立复审记录与复现指针：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/monitoring-readable-output-review-20260916.md`。该次确认两项 P2 与一项窄容量 P3；用户随后授权在原 PR 修复，记录包含真实 Runtime 封装及 Admin 报告/卡片对照测试入口。后续修复和审查状态仍从 PR 查询，不能用 CI 通过代替这些新增场景。

## 2026-09-16 发布与工具同步追溯

- 发布应依次完成 MCP、Provider tools/list 同步、目标 Preset 绑定，再执行 Admin。工具目录同步不等于 Preset 已启用；保存后重新加载确认绑定计数与原有模块。
- 本次工具差异为新增 `monitoring_prepare_incident_report`，原 11 个工具没有删除或变更。目标 Preset 保存后回读为 12/12，Structured Output 保持启用；此步骤不代表新报告协议已开启。
- MCP 生产发布与证据检查见 [run 35081811226](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35081811226)；Admin 生产发布、飞书暂停/恢复和最终 rollout 见 [run 35082545724](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35082545724)。配套 Worker 须等主 Admin 发布完全成功后执行，避免与飞书恢复重叠；见 [run 35083269378](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35083269378)。实时状态仍应从 workflow 查询。
- 本次未修改报告协议环境开关、Prompt、Skills 或 Structured Output。启用新协议仍按 Admin `REPORT_DELIVERY_ROLLOUT.md` 核对资源与 canary，不把生产就绪或证据工具检查当作报告回填、报警认领端到端验收。

## 2026-09-16 发布后验证边界

**Why:** rollout 成功只证明发布时的就绪条件，不能保证后续工作负载稳定；历史标记完成的报告也未必满足当前严格证据规则。

**How to apply:** 发布后复查各 Deployment 的实际 Pod 镜像、ready、restart 和 lastState；出现 Worker OOM 时先从 `apps/admin/app.py` 与 `workers/analytics_worker.py` 核对任务归属，不能把 Worker 故障直接等同于主服务报警认领停止。报告验收需记录样本日期和失败规则，不把历史样本拒绝归因于新发布。

- 本次只读验证发现 Worker 在 rollout 后 OOMKilled；主 Admin 两副本健康。历史报告的两个 Run 回放均未通过当前必需证据检查，尚未获得新协议或真实认领端到端通过证据。
- 具体时间窗口、Pod / Run 标识、配置回读与 109 项回归结果见本地记录 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/monitoring-prod-verification-20260916.md`。健康状态会变化，后续须重新查询 ACK / Runtime，不从本页推断已修复。

## 2026-09-16 隔离验收与首次报告参数

**Why:** 真实隔离 Run 的 Markdown 完成不能证明 Admin 接收。首次准备时空替代哈希被工具拒绝，Agent 后续编造全零前驱，最终被 Admin 当前 Run 的替代链门禁拒绝；属于切换前必须暴露的交付失败。

**How to apply:** 工具可将空字符串与省略字段统一为首次报告，但不得接受不存在的替代关系；真实更正仍由 Admin 校验前驱。复测必须重新生成真实报告，不能修改历史事件或绕过来源校验。修复及回归入口见 [MCP PR #65](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/65)，生产状态从对应 workflow 查询。

- 隔离卡片测试还需隔离持久化：`mark_analysis_terminal` 会调用 `materialize_clear_agent_problem`，直接插入复制真实证据的测试 Incident 可能关联既有 Problem 或创建 Bug；不要仅改 Incident ID 就认为完全隔离。独立 SQLite 的接受/渲染测试不等于真实飞书回调验收。
- Analytics Worker 不执行这条报告派发、回收和通知循环；从 `apps/admin/app.py` 核对任务归属，Worker OOM 独立跟进，不应成为报告协议切换的笼统前置条件。
- 本次 Run、调用标识、失败规则和当前未完成项：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/monitoring-prod-verification-20260916.md`。不要从本页推断新协议已启用。

## 2026-09-16 下游 trace 完整性诊断

**Why:** `pagination_incomplete` 不一定表示 Agent 没有翻完任何一条查询。真实隔离 Run 已完成一条 trace 的完整分页，但从主查询导出的必查 trace 有三条，只覆盖一条；同时更早的大 page-size 尝试留下分页失败原因，不能仅根据错误码猜根因。

**How to apply:** 联合核对 canonical 调用、`_complete_sls_page_chain_groups` 的完整链及 `_check_result` 的 `derived_trace_ids` 全集。保持每条分页链的查询、窗口和 limit 一致，再检查所有必查 trace 均有完整链。用 `monitoring_incident_evidence_retry.py:schedule_evidence_reanalysis` 生成补查指令，不能用手工放宽门禁代替补查。generation 补查可能由 Runtime 建立隔离的新 Thread，应以实际投递回执为准，不假定 `thread_id_hint` 必然复用原 Thread。

- 具体 Run、调用和重试回执仍查本地生产验证记录及 Runtime；本页不代表验收通过或协议已开启。

## 2026-09-16 报告结构预检与记录定位

**Why:** 真实 canary 在 MCP 准备成功后仍可能被 Admin 拒绝。`reportedSymptoms` 是有限白名单的标量摘要，不接受任意环境、窗口或 trace 字段；仅检查对象类型不足。报告把另一条日志的短语与当前 recordRef 组合，也会导致 observation_assertion_failed。

**How to apply:** 在报告准备阶段镜像消费者的纯结构约束，让模型能在同一 Run 修正；证据真实性和接受仍由 Admin 决定。核对 `IncidentDiagnosisV2.validate_reported_symptoms` 与 MCP `validateReportStructure`，修复及回归见 [MCP PR #66](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/66)。观察值必须从同一个 recordRef/path 解析并程序化断言，不能从不同记录借用短语。临时修改报告副本用于诊断剩余错误，只能算诊断，绝不替代 canonical 报告的真实验收。

- Schema 校验通常先于证据校验，错误从证据问题变为 Schema 问题不能证明证据已通过。发布与真实复验状态从 workflow 和本地验证记录查。
- 飞书 user 缺建群 scope 不代表现有 bot 也无权限。任务允许机器人创建时，可按 lark-im 技能使用已有 bot 权限创建私有群并加入请求者与 Monitoring bot，再完整读回成员；不要重复要求用户扩权。本次实际建群与成员证据见验证记录。
- Workbench 下载可能被客户端拦截；其文件编辑器可只读打开状态文件并复制完整文本。复制后核验 JSON 和 Run ID，发布后不要依赖旧 Pod 的 /tmp 文件继续存在。

## 2026-09-17 原报警 workload 与下游部署证据

**Why:** 隔离 Run 读取了下游 Manager 部署和 Gemini 代码，聊天仍可生成完整 Markdown，但 Admin 的 adaptive_deployed_revision 与 adaptive_code_file 拒绝该报告。原事故绑定来自主窗口日志验证的报警源 Pod，下游版本不能替代源服务版本。

**How to apply:** 对照 `monitoring_incident_report_validation_v2.py` 的 `_incident_deployment_bindings`、`_bound_incident_deployment_evidence` 与真实 deployment_get 参数，先读取主窗口证实的原 workload 部署和应用调用代码，再补查下游。不得通过放宽绑定或拼入不同 Run 的证据验收。指令修正见 [Admin PR #885](https://github.com/world-sim-dev/vidmuse-admin/pull/885)；发布和真实补查结果重新查 PR/workflow 与本地验证记录。

- 当前任务证据入口仍为 `output/monitoring-prod-verification-20260916.md`；本页不表示新协议已启用或卡片已验收。浏览器连接超时与 Runtime 连接超时分别处理；预检阶段失败应重试同一幂等事件，不另建随机事件冒充成功。

## 2026-09-17 重试包与 Runtime 单消息容量

**Why:** 调查规则、证据策略、重试反馈和 JSON 证据拼成一条文本后，可超过 Runtime 的单消息 UTF-8 字节上限。字符数不等于字节数；泛化 HTTP 400 不能说明是账号、Worker 或报告 Schema 故障。

**How to apply:** 对照 Maxwell `internal/modules/runtime/inputformat/validation.go` 与 Admin `_message_content` 的实际字节数。此次同一隔离事件的单条 35,696 字节请求被拒绝，规则和完整 JSON 按原顺序无损分段后返回 202；第一消息保留稳定 ID/报告绑定，附加证据消息不复制绑定。修复见 [Admin PR #885](https://github.com/world-sim-dev/vidmuse-admin/pull/885) 的 `_message_parts` 与历史恢复回归：新输入容量不能阻断已接收 Run 的历史回填，不得截断证据或放宽 Runtime 上限。单个语义块仍超限时明确失败，不能宣称支持任意大小输入。

- 完整对照、字节一致断言、真实 Thread/Run 与未完成验收项见本机 `output/monitoring-prod-verification-20260916.md` 的 Runtime 400 isolated root-cause verification。202 接单不等于报告已被 Admin 接受，更不等于认领、卡片回填或新协议切换成功。

## 2026-09-17 分段接收与证据关联的消费者对齐

**Why:** Runtime 接受两条完整语义消息，并不代表 Admin 能还原其报告上下文。真实 canary 暴露 `_incident_context_from_user_action` 仍只解析第一条消息的尾部 JSON；修复后又暴露部署采集认可的事故日志 Pod→workload→部署链，没有被报告证明阶段用于不可变代码版本关联。

**How to apply:** 在同一 canonical user action 中，只恢复稳定消息 ID 对应、紧邻、唯一且不携带另一个绑定的证据 companion；仍核对 Incident、event、generation 和 report binding。证明阶段复用 `_bound_incident_deployment_evidence`，保留原始命名空间、主查询、事故窗口及 current-Run 约束。代码和正反例见 [Admin PR #885](https://github.com/world-sim-dev/vidmuse-admin/pull/885)。不能用当前 Deployment 快照证明历史事故部署；关联正确之后，时间和实际字段值校验仍可能合理拒绝报告。

- MCP 的 prepared 仅是准备成功，不是 Admin 接受。`eq` 数组值、过短 contains 等消费者格式限制应提前给出字段级纠错，见 [MCP PR #67](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/67)；证据和时间语义仍归 Admin 验证。
- 本次 canonical 回放、完整 Monitoring 回归、MCP 全量测试和后续隔离纠错 Run 的证据查本机 `output/monitoring-prod-verification-20260916.md`；不要从 PR 或单测推断生产开关已变更、真实认领已验收。

## 2026-09-17 真实卡片回调与隔离清理

**Why:** 报告已准备、SQLite 验收和真实飞书认领属于不同证明层。认领前的 Incident 卡片依赖准确 chat/root receipt；仅标记 attention_excluded 也不能保证测试数据永远不进入日报或 Problem 聚合。

**How to apply:** 先用内存库和实际服务验证专用样本不进入日报窗口、待调度队列和 Problem 物化，再只向明确的隔离群发送原装卡片。验证真实按钮回调、Assignment 版本、后台状态活动回执及原卡片 UI，不能只看 toast。2026-09-17 已完成该真实回调链；与当时仍未通过的新报告证据回填分开表述。关闭测试按钮后，核对无活动发送、无真实调查和 Problem/Evidence 关联，备份并仅清理本次明确创建的专用记录，不能调用全局 claim/reconciliation 来清理。具体 ID、七条记录清理回执与本地可复现测试见 `output/monitoring-prod-verification-20260916.md`。

- 新报告的精确字段断言仍可能失败，例如把相邻记录的标准化 error code 当作当前 `/log` 字段中的原文；不能通过改写 canonical 报告或放宽 contains 断言解决。
- 私有 helper 也可能被专项策略测试直接使用。接口新增参数后，除了相关模块测试，还应运行完整 Monitoring 测试及准确 PR HEAD 的 CI；此次兼容修复仍指向 Admin #885，不从旧 HEAD 的 CI 推断发布准入。

## 2026-09-17 严格接收与分层验收边界

**Why:** 真实模型调用准备工具和输出 Markdown 后，仍需证明原始 canonical 报告通过 Admin 严格校验，再由状态机落库并构建卡片。单独验证过认领回调，不等于同一新报告已走完生产链路。

**How to apply:** 2026-09-17 第三次标准纠错 Run 在保留真实字段值、事故窗口、版本与来源绑定校验的情况下通过；使用 PR #885 的进程内修复回收，原装 Admin 状态机在显式 SQLite session 中得到 delivered / analysis_completed / agent.tool.result，并成功构建卡片。真实飞书认领测试另有独立回执。两个结果应分别记录，不能合并宣称生产新协议已全面验收。精确 Thread/Run、报告 hash、字段数与未发布边界查 `output/monitoring-prod-verification-20260916.md` 的 strict report acceptance completed。发布仍先核对准确 HEAD 的 CI、部署版本与 preset 工具同步，之后再验证正式消费链路。

## 2026-09-17 缺少 Pod 注解与超大源码的真实缺口

**Why:** 13 份历史 Run 的规范工具调用包含部署查询，但告警没有 latest_pod，Admin 绑定函数提前返回后把它们标为 not_attempted。只加强“必须读原服务”的提示词无法修复消费者丢掉证据的问题。解开这一层后仍可能暴露报告字段错误或源码读取容量问题，错误类别并非互斥。

**How to apply:** 对照 `_incident_deployment_bindings`：缺少注解且没有完整显式 workload 标签时，只允许从规范主查询、精确事故窗口的同一记录推导 Pod/namespace→Deployment；保留显式标签限制，不能拿无绑定的当前 Pod 列表、下游或扩窗记录代替。13 份完整 owner 回放均恢复部署和 commit 绑定，但不是完整报告验收；细节见本机 `output/monitoring-prod-verification-20260916.md` mandatory preservation fixes。

- [Admin #885](https://github.com/world-sim-dev/vidmuse-admin/pull/885) 同时为格式错误的 observation ID 走原有有界 fresh-evidence Run；不得拼接、修补旧 ID，不改变其他完整性拒绝和各类重试预算。`reportedSymptoms`、错误 evi_ ID 与非标准 correlation key 的原始失败可能重叠。
- [MCP #67](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/67) 给 get_file 增加同一完整 commit/path 的 start_line/end_line，核对完整 blob 后返回行号、blob SHA、nextStartLine；完整片段不等于完整文件。源扫描与响应分别有界；超限缩小范围，不能截断代码假装已读。真实 provider_router.py GitHub 响应在两个目标 commit 的 connector 回放中逐字节重建，文件内容不写入知识库或代码仓库。
- 部署后必须先同步 preset 的工具定义，再使用新增参数；PR/本地回放不代表历史报告已重新生成或生产开关已切换。

## 2026-09-17 发布后源码字节与传输脱敏边界

**Why:** Connector 验证过的 Git blob 与模型最终收到的内容处在不同边界。通用凭据脱敏可能把源码中的配置读取表达式当作赋值值替换；因此行范围完整不代表传输内容逐字节等于未脱敏 Git 原文。

**How to apply:** 同一不可变 commit/path 分段读取后，从完整 tool-result owner 取回内容，检查行号连续性，再分别比对原文件与按现有脱敏规则处理后的字节。核对 server.go 的 redactTransportText、记录 ID 计算顺序和源 blob 校验，不能为了哈希一致关闭脱敏或伪称原文完整。2026-09-17 真实 provider_router.py 的唯一差异落在 301–400 行配置赋值表达式；其余片段一致，脱敏后整体哈希一致。生产发布、工具同步、日报预览、隔离卡片回执与协议切换的后续状态入口见本机 output/monitoring-prod-verification-20260916.md 的 production release 小节，以及 [MCP 部署](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35188435006)、[Admin 部署](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35188707690)。发布成功不能替代真实认领回调或新协议消费验收。


## 2026-09-17 正式 preset 与新增数字占位字段

**Why:** 分段读取新增 start_line/end_line 后，正式模型可能把 flat union schema 的所有字段都输出，在 describe 中补两个 0。既有归一化只删除无关空字符串/null 和 limit，因此新增数字占位会让原本可用的仓库发现操作失败。只跑合法 get_file 范围测试不能覆盖这个生产回归。

**How to apply:** 覆盖真实模型完整参数包；仅在不读取文件的 operation 上忽略已知 line-bound 字段的数字零，保留非零/错误类型拒绝及 get_file 的完整范围校验。修复、CI 与发布指针见 [MCP #68](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/68)。正式 preset 的协议化 prompt/skills、Structured Output、Admin 有效 env 应分别保存回读；资源更新前备份精确旧值，Pod 间需要继续验收的回执放到已有 PVC 的受限目录，不能只放会随滚动消失的 /tmp。当前开关、探针终态和实际发布版本只查本机 output/monitoring-prod-verification-20260916.md 的 authorized production protocol cutover 及后续条目；不能从此 page 推断探针已通过。


## 2026-09-17 Alert trace aliases and root-cause integrity

**Why:** The original alert API stores an exact trace in context.annotations.latest_trace. Generic aliases miss it and reject a valid correlation. Resolving that compatibility gap can reveal an independent report error that combines direct errors from different traces.

**How to apply:** Recognize only that exact path from monitoring_alert_get_context / monitoring_alert_list, preserving observation IDs, record hashes, exact values, eq operators, producer checks and root-cause clustering. Cover wrong source/path/type/redaction/operator in negative tests. A process-local prospective patch identifies the next rejection; acceptance must rerun on deployed code. See [Admin #887](https://github.com/world-sim-dev/vidmuse-admin/pull/887); current release and formal-preset acceptance evidence lives in output/monitoring-prod-verification-20260916.md. Passing tests does not imply an accepted report.


## 2026-09-17 Correction transport and downstream proof selection

**Why:** A retry-specific instruction can reintroduce final JSON after the tool-report protocol requests Markdown. Completing canonical trace pagination also does not authorize citing a separate trace query with an extra error-text filter.

**How to apply:** Build correction delivery instructions from the persisted protocol, covering both omitted/explicit legacy and tool delivery ([Admin #887](https://github.com/world-sim-dev/vidmuse-admin/pull/887)). Preserve rejection of downstream_trace_record_acquisition_overclaim; add that selection error to the existing bounded correction category with guidance to reacquire and cite the complete exact trace query, without extra filters, hash rewrites or budget increases ([Admin #888](https://github.com/world-sim-dev/vidmuse-admin/pull/888)). Check current deployment and acceptance in output/monitoring-prod-verification-20260916.md, not from this page.

## 2026-09-17 原卡更新回执与正式 preset 验收门禁

**Why:** 认领更新可能直接修改原告警卡片。发送端已验证原消息与群范围，但大盘若将所有非 alert_opened 活动都按话题回复校验，会把成功回填误判为缺少 thread/root/parent。另一边，正式 preset 可生成外观正确的 Markdown，却在新 evidenceId 下沿用旧 Run 的 recordRef；prepared 不能证明引用可被 Admin 接收。

**How to apply:** 大盘与发送端对同一原卡更新采用相同的 exact root receipt 条件；保留错群、错消息、缺回执和普通话题回复的负向用例，不能补造生产回执。见 [Admin #889](https://github.com/world-sim-dev/vidmuse-admin/pull/889)。跨 Run 引用继续拒绝，不因验收样本失败而扩大自动重试白名单或重置预算。正式 preset 未通过时按发布门禁回退配置；配置回退只控制承接协议，不能声称它修复了模型引用错误。当前执行状态与正式拒绝证据见本机 output/monitoring-prod-verification-20260916.md，不从 PR 合并或工具 prepared 推断生产验收成功。
