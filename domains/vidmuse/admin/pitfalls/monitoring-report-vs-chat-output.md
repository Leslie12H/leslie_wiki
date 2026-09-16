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
