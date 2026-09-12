---
name: evolve-preset-evaluation-entry
type: reference
created: 2026-09-12
updated: 2026-09-12
tags: [maxwell, evolve, a2a, preset, evaluation]
links: [vidmuse-a2a-executor, evolve-maxwell-tuning-receiving]
---

# 业务 Preset 接入 EVOLVE 的评测入口

2026-09-12 按 fetch 后主干 `4a91b77855583e960580bb452f827cb1fe6d986e` 核对。目标管理页跳到登录，未读取目标实际配置；源码结论不代表线上已部署、已登记或已执行。

## 去哪核对

仓库：https://github.com/world-sim-dev/maxwell-ai 。以下路径随代码变更，使用前核对最新版本。

- `apps/studio/src/appRoutes.tsx`：`/agents/:presetId` 属于 Maxwell Preset 管理页；不能仅凭业务称它为 adapter，就认定 URL 是外部 Agent Card。
- `apps/studio/src/products/evolve/executor/ExecutorRegistrationForm.tsx`：在同业务选择 Maxwell Agent，使用 `presetId`；独立 A2A 服务使用 Agent Card 地址。部分说明文案与能力判级可能不同步，需以后端 probe 为准。
- `services/evolve-server/internal/modules/evolve/application/commands/executors.go`：解析 Preset、构造内部地址、维护业务执行凭据并分配执行器 ID；登记后的 `executorRef` 与 `presetId` 是不同引用。
- `services/evolve-server/internal/app/toolcaller.go`：`register_executor` 返回待确认登记卡；`start` 使用登记后的 executorRef 及冻结的 Variant、CaseSet、JudgeSpec。
- `services/evolve-server/internal/app/integration/a2a/registry.go`：`maxwell_preset` 发送 Case 用户文本；`external_a2a` 发送执行请求结构。输出优先取 Task artifacts，再回退状态消息或历史。
- `services/evolve-server/internal/modules/evolve/application/executorprobe/probe.go`：健康状态与能力等级分开判定；调优级别取决于能力声明、marker 和实际应用回执，不能按接入 kind 写死。
- `services/evolve-server/docs/executor-kit/README.md` 与同目录 schemas：外部执行器契约、预检、交互和回执要求。
- `services/agent-server/internal/modules/runtime/extensions/a2aagent/middleware.go`：若 Preset 配置远程 Agent，确认其等待必要的远端最终结果；接单回执不能当成完成结果。

**Why:** 选择 Preset 会评测它及其下游调用的整条链路；直接选择独立执行器则有不同输入契约与评测范围。错误选择可能只测到转述、接单回执或协议解释。

**How to apply:** 先确认要评测的对象和实际输入格式，再在同业务登记；先用少量真实业务 Case 验收最终产物、失败状态和判卷依据。只有需要候选调优时再核验目标是否真正加载 Variant 及返回版本证据。凭据只在产品专用表单处理，不放入对话。预检会真实调用目标，不把登记或健康状态当成评测完成。


## 2026-09-12 Nextplay 外层执行器：业务角色纠正

用户明确：Nextplay 是被测和调优的 Agent；所给 Maxwell Agent 管理页对应包在 Nextplay 外层的执行器 Agent。仅依据 `/agents/:presetId` 推荐直接按被测 Preset 登记，不足以满足这次范围。

**Why:** 部署载体与业务角色不同。EVOLVE 应围绕 Nextplay 冻结 TargetProfile、Case、baseline/candidate；executorRef 指向外层执行器。若按普通 maxwell_preset 路径派发，外层只收到 Case 用户输入，不能据此获得完整 Nextplay Variant 执行合同。

**How to apply:** 以 external_a2a 协议登记外层执行器的实际 Agent Card，TargetProfile 描述 Nextplay 并关联登记后的 executorRef；在 EVOLVE 生成并确认 a2a_live Run。外层把 Case 输入交给 Nextplay、实际应用 Nextplay 候选并等待完成，回传原始结果和版本证据；EVOLVE 负责判卷和比较。不要将候选应用到外层执行器本身。尚未检查具体 Preset 的配置，也未验证其下游工具或线上运行。

同一主干 `4a91b778` 的兼容性核对入口：

- `services/agent-server/internal/app/integration/runtime/a2a/transport.go`：Card 路由为 `/api/a2a/{agentId}/.well-known/agent-card.json`；实际 origin、代理和鉴权须在线验证，管理页 URL 不是 Card。
- `services/agent-server/internal/app/integration/runtime/a2a/adapter.go` 与 Runtime `inputformat/formatter.go`：检查执行请求 DataPart 是否保留并进入模型输入；输入不能只剩简报。
- `services/evolve-server/internal/app/integration/a2a/registry.go` 的 `parseParts`：只将带 schemaVersion 的 A2A DataPart 对象识别为 trial-evidence；JSON TextPart 走纯文本回退。
- `services/agent-server/internal/app/integration/runtime/a2a/projector.go`：接受 text/plain 时文本原样输出；转换到 application/json 时文本成为 JSON string，没有解析成对象。
- `services/agent-server/internal/modules/runtime/extensions/structuredoutput/middleware.go`：仅规范化模型 Text 为 JSON 文本，不能由开启此开关推断已产出 A2A DataPart。

验收时必须区分：协议可调用、Nextplay 真实执行、结构化证据可被识别、Nextplay 候选实际生效。若该外层沿用普通 LLM 文本输出链，需要补执行器输出的协议投影或严格解析，单改 Prompt 要求输出 JSON 不足以证明调优回执通路已接通。上述是源码边界，不是该线上 Agent 已复现的缺陷。
