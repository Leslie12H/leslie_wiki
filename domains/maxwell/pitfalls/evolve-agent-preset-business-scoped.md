---
name: evolve-agent-preset-business-scoped
type: pitfall
created: 2026-09-04
updated: 2026-09-04
tags: [maxwell, evolve, preset, multi-tenant, a2a]
links: [maxwell, maxwell-quality-eval]
---

# EVOLVE 调优 Agent 写死单个 Preset ID,在其他业务不可用

2026-09-04 确认:EVOLVE(`services/evolve-server` + `apps/studio/src/products/evolve`)把"评测与调优 Agent"落成了某一个业务里的一个 Preset(ID 写死在前端 `config.ts`),其他业务点"和 Agent 开始"报"当前业务没有可用的评测与调优 Agent Preset"。

根因链(去代码看,不抄):

- `agent_presets` 表 `business_id NOT NULL`,Runtime 按 `(businessId, presetId)` 解析 Preset → Preset 天然业务私有。
- evolve-server 可信 MCP 只从 `ai.maxwell/execution-context` 取租户,且禁止工具参数带 `businessId` → Thread 在哪个业务,事实就落哪个业务。
- A2A 执行器和允许的 Preset 都是静态 env(`EVOLVE_A2A_EXECUTORS`、`EVOLVE_MAXWELL_PRESET_IDS`),接新业务要平台改配置重启。
- Runtime 规定非账号主体(Business API Key)只能创建 business 可见的 Thread(`runtime/transport/http/controller.go` 里 "non-account principals can only create business-visible threads")。所以任何"服务端代建 Thread"的门面(全局助手、EVOLVE)拿到的都是家业务内 business 可见的 Thread,按账号隔离必须门面自己做,不是 Runtime 原生私有。
- Variant 的应用永远在 A2A 另一侧的适配器做,EVOLVE 只产出变更内容;"影子 Preset"一类由 EVOLVE 去改被测 Preset 的想法已否决。

方案(提案 v2,未实施):`docs/evolve-shared-tuning-agent-design.md`(maxwell 仓库,分支 `design/evolve-shared-tuning-agent`)。核心取形:调优 Agent 只有一个物理 Preset,放在平台业务里;evolve-server 当门面(用平台业务 API Key 代建 Thread,记会话表 thread→目标业务),MCP 按 execution-context 的 threadId 查会话得到目标业务;执行目标改业务级注册表,探索走 `evolve_run probe` 不再依赖 a2a-agent 中间件。不改 agent-server。v1 曾提"平台模板 + 每业务复制托管 Preset",因要改 agent-server 且绕路被否。

闭环差距分析(同日):仓库 `docs/evolve-gap-analysis-20260904.md`。两个沉默错误值得记住:(1) Maxwell 类被测方没有适配器应用 Variant,候选 Run 实际跑的是基线,系统不报错;(2) 纯对话目标的证据是 `{"text":...}`,JudgeSpec 路径写 `/answer`(playbook 示例)会整轮 0 分。

**Why:** Runtime 只按 (业务, Preset) 解析,跨业务 Preset 这条路走不通;Leslie 明确不允许改 agent-server/Runtime。全局助手的门面在 agent-server,EVOLVE 把门面放到 evolve-server 就能零改动 agent-server;目标业务不能靠工具参数带(evolve 禁止),但门面建 Thread 时天然知道目标业务,所以用 threadId→会话映射。

**How to apply:** 再遇到"一个 Agent 服务所有业务"的需求,先问三件事:(1) Runtime 边界能不能动(通常不能);(2) 这个 Agent 碰的是元数据还是业务资产(决定能不能集中到家业务);(3) 下游服务的租户从哪来(execution-context 还是参数)。然后找'谁在创建 Thread 时天然知道目标业务',让它记映射,别让 Agent 或前端传租户。设计文档里的"需要拍板的点"(发起会话最低权限、目标凭据来源、会话有效期)还没定,推进前先找 Leslie 确认。
