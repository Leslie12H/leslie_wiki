---
name: monitoring-report-vs-chat-output
type: pitfall
created: 2026-09-16
updated: 2026-09-16
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
