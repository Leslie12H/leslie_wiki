---
name: evolve-preset-evaluation-entry
type: reference
created: 2026-09-12
updated: 2026-09-12
tags: [maxwell, evolve, a2a, preset, evaluation]
links: [vidmuse-a2a-executor, evolve-maxwell-tuning-receiving]
---

# 业务 Preset 接入 EVOLVE 的评测入口

2026-09-12 按 fetch 后主干 `4a91b77855583e960580bb452f827cb1fe6d986e` 核对。最初目标管理页跳到登录；后续已从 UI 核对业务身份，见本文“评测业务与凭据所属业务纠正”。源码结论不代表线上已部署或真实评测已通过。

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

**How to apply:** 先确认要评测的对象和实际输入格式，再在承载评测工作的业务登记；外层执行器可以属于另一个业务，见下文 Nextplay 场景。先用少量真实业务 Case 验收最终产物、失败状态和判卷依据。只有需要候选调优时再核验目标是否真正加载 Variant 及返回版本证据。凭据只在产品专用表单处理，不放入对话。预检会真实调用目标，不把登记或健康状态当成评测完成。


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


## 2026-09-12 外层执行器鉴权核验指针

- Maxwell A2A 使用目标所属业务的 Business AppKey；核对 `services/agent-server/internal/app/api/http/a2a_api.go` 与 `runtime/a2a/card.go` 的鉴权和权限映射。Card/Task 读取需要 runtime_read，发起/继续/取消需要 runtime_run。
- 密钥入口见 `apps/studio/src/pages/business/BusinessAPIKeys.tsx` 和 `routes.ts`。创建需要 api_key_manage，完整 key 仅创建时展示；后续列表不返回明文。不要在对话或日志中传递 key。
- `services/evolve-server/internal/app/integration/executorsource/source.go`：共享业务托管凭据仅用于 maxwell_preset；external_a2a 使用登记时保存的 CredentialRef，当前不能因托管在 Maxwell 就自动复用共享凭据。
- 外层调用 Nextplay 的下游凭据由其连接/工具配置负责；不能把 EVOLVE 到外层的 AppKey 混作 Nextplay 鉴权。
- 2026-09-12 用户授权尝试绑定及预检，但登记页仍跳登录，未提交登记或触发预检。之前企业登录遭自动审批拒绝，后续未重试该被拒动作，保留登录页供用户完成登录。


## 2026-09-12 评测业务与凭据所属业务纠正

此前直接把外层 Agent URL 中的 businessId 用于 Nextplay 评测入口，混淆了评测工作所属业务和执行器所属业务。2026-09-12 从已登录 UI 核对后的入口指针如下；业务名称、配置和执行状态会变化，每次使用应打开对应页面复核。

- Nextplay 评测工作入口：[互动影游NexPlay 的 EVOLVE](https://agent.sandaii.cn/evolve?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263)。本次 Nextplay 的评测任务、资产与执行器登记在此业务中管理。
- 外层执行器配置入口：[影游a2a 的 Agent](https://agent.sandaii.cn/agents/697f4aa1-0a2f-4ce6-a54f-5c8c70453b71?businessId=d913480b-bbf3-4c3f-956b-cab3a6854dee)。external_a2a 登记使用此 Agent 的 [Agent Card](https://agent.sandaii.cn/api/a2a/697f4aa1-0a2f-4ce6-a54f-5c8c70453b71/.well-known/agent-card.json)。
- EVOLVE 到外层的 Token 从[影游a2a 业务 API 密钥入口](https://agent.sandaii.cn/api-keys/manage?businessId=d913480b-bbf3-4c3f-956b-cab3a6854dee)管理；它属于接收 A2A 请求的业务。外层到 Nextplay 的调用工具、目标地址及凭据另行配置，不能据此 AppKey 推断已具备下游调用能力。
- 原失败执行器 `executor-2842a8969df8d6c3ed4be085` 的排查入口是[影游a2a 业务 EVOLVE](https://agent.sandaii.cn/evolve?businessId=d913480b-bbf3-4c3f-956b-cab3a6854dee)；不要把这个业务中的登记自动当作 Nextplay 业务已绑定的证据。运行状态需实时读取。

**Why:** businessId 决定评测资产与登记的归属；A2A Token 鉴权的是远端执行器所属业务。这两种归属可以不同。把用户所在的 Nextplay 业务误换为外层 Agent 所在业务，会把评测工作建到错误的位置；换用 Nextplay 的 AppKey 也不能解决远端影游a2a 的访问权限。

**How to apply:** 先进入 Nextplay EVOLVE，在该业务的执行目标中登记或复用 external_a2a，指向影游外层 Card 并提供影游业务 AppKey；将 Nextplay TargetProfile 与返回的 executorRef 关联。先核验外层确实能执行 Nextplay，再以固定基线和一条代表用例发起真实运行，逐层核对最终输出、结构化执行证据与评分。本文没有把业务身份核验视为已完成绑定、修复或真实测试。

### different origin 的核验入口

2026-09-12 用户报告的 `agent card cannot forward its credential to a different origin` 是凭据转发门禁，不是两个 Maxwell 业务不同的判断。按本次核对的 `4a91b778` 源码，出现该错误时 Card 已取得 HTTP 200 并解析，检查发生在 SendMessage 之前；错误后拼接的 `target acceptance is uncertain` 属于通用调度文案，不能据它推断目标已收到此条派发。

- `services/evolve-server/internal/app/integration/a2a/registry.go:778-825`：核对 fetchCard 的状态码、解析、supportedInterfaces 检查以及 BearerToken 转发门禁；登记 Card URL 与每个接口 URL 必须同源。
- `services/evolve-server/internal/foundation/safehttp/origin.go:31-46`：核对 SameOrigin 对 scheme、host、有效端口的比较，businessId 和 URL path 不属于同源条件。
- `services/agent-server/internal/app/integration/runtime/a2a/transport.go:290-293,483-495`：核对外层 Card 暴露的接口地址及其 origin 构造，再沿实际入口代理配置检查公开地址是否一致。

**Why:** 正确 Key 不能越过防止凭据被转发至其他 origin 的安全检查。只有先看实际 Card 宣告的 URL，才能区分协议、域名或端口差异；不能未取到 Card 就断言是 http/https、反向代理丢头或 Key 无效。

**How to apply:** 安全读取已登记的 Card URL 和其 supportedInterfaces URL，仅比较 URL，不输出 Token；修正目标 Card 的公开接口地址或登记地址，使其符合真实对外路由与同源约束后再预检。不要关闭凭据同源检查，也不要根据通用 uncertain 文案直接重复下发。此次知识录入尚无实际 Card 接口 URL，具体差异保持待核验。
