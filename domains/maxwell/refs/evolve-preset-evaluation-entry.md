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

**How to apply:** 以 external_a2a 协议登记外层执行器的实际 Agent Card，TargetProfile 描述 Nextplay 并关联登记后的 executorRef；在 EVOLVE 生成并确认 a2a_live Run。外层把 Case 输入交给 Nextplay、实际应用 Nextplay 候选并等待完成，回传原始结果和版本证据；EVOLVE 负责判卷和比较。不要将候选应用到外层执行器本身。本段最初未读取具体 Preset；后续 UI/Prompt 核验见“实际外层是 Candidate Runner”，下游工具与线上运行仍未验证。

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
- 2026-09-12 最初绑定尝试停在登录页，未提交登记或触发预检；后续已完成业务身份、Prompt 与只读 Card 核验，见下文。


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

**How to apply:** 安全读取已登记的 Card URL 和其 supportedInterfaces URL，仅比较 URL，不输出 Token；修正目标 Card 的公开接口地址或登记地址，使其符合真实对外路由与同源约束后再预检。不要关闭凭据同源检查，也不要根据通用 uncertain 文案直接重复下发。后续已读取实际 Card 并确认 scheme、host 两项差异，见“线上 Card 已确认跨 origin”。


## 2026-09-12 实际外层是 Candidate Runner：接通前的映射核验

已从 UI 读取[外层 Preset](https://agent.sandaii.cn/agents/697f4aa1-0a2f-4ce6-a54f-5c8c70453b71?businessId=d913480b-bbf3-4c3f-956b-cab3a6854dee)的 Prompt 与绑定 Skill 信息。核验入口是 Agent“Candidate 运行 Agent（A2A 测试）”、Prompt“Candidate 运行 Agent（测试）”、Skill `maxwell-candidate-runner`（“Maxwell Candidate Runner（测试）”）；名称和内容会变，使用前从该 Preset 重新读取，不复制完整 Prompt 到 wiki。

这次配置核验说明不能因“包在 Nextplay 外层”就假设该 Agent 已固定指向 Nextplay，也不能把普通 Candidate Runner 自动当作 EVOLVE Executor Kit。沿实际 Prompt 和 Skill 继续检查：

- **执行输入与基准定位：** 核对显式基准 Preset 链接或 businessId+presetId、业务任务 prompt，以及完整替换 SP / 完整 Skill 资源包至少提供一种的输入要求。基准不能从 runtime.env 或历史对话猜测。EVOLVE 的 Case、Variant 是否已有映射代码，应查实际 Skill 脚本，不能根据自然语言能力推断。
- **候选执行与凭据：** 沿绑定 Skill 的脚本核对临时 Prompt/Preset 创建、单次运行、status 等待、文件独立保存及清理路径；检查调用凭据从 Skill runtime.env 获取的约束，不读取或抄录凭据值。Prompt 描述了这些步骤，不代表脚本、权限或隔离已经验收。
- **输出与文件字节：** 核对最终原始回复，以及 `manifest.json`、`outline.json`、`assets.json`、`route.json`、`media.json` 的文件清单（name、path、sha256）和 contextId / Runtime 文件接口取字节路径。回给 EVOLVE 的文件清单不是实际内容；文件回收、哈希与证据投影需要明确实现。
- **职责边界：** 从当前 Prompt 核对 Runner 不承担 Judge、Dataset 批处理、评分和上报；这些仍由 EVOLVE 管理。不要将“运行一次并返回结果”当作整套评测已完成。

**Why:** 这个外层的实际输入面向候选运行，实际输出面向原始回复和 Runtime 文件；EVOLVE external_a2a 的输入和 trial evidence 有自己的合同。A2A 能连通只解决传输，还需证明两侧字段、候选版本和文件证据衔接。已有影游a2a 业务登记也不证明 Nextplay 业务存在执行目标；每次从[Nextplay EVOLVE](https://agent.sandaii.cn/evolve?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263)刷新任务和登记列表核对。

**How to apply:** 先明确要运行的 Nextplay 基准 Preset 与完整候选，再检查或补齐两处适配：EVOLVE request → Candidate Runner 输入，Candidate Runner 原始回复及文件字节 → EVOLVE trial evidence。接着在 Nextplay 业务完成登记与单条基线/候选试跑，验收真实输出、候选实际生效和文件可读，最后由 EVOLVE 判卷。2026-09-12 这次核验仅到 UI/Prompt，尚未读取绑定 Skill 脚本或实跑；两处映射、执行隔离及成功状态均未验证。


## 2026-09-12 线上 Card 已确认跨 origin：CDN/ALB 核验入口

2026-09-12 对登记的 Agent Card 进行一次带目标业务凭据的只读 GET，已取得可解析的 200 响应。该次返回的接口宣告与登记地址在 scheme、host 两项不一致；不再把具体差异视为未知。此处保存核验指针和判断方法，URL 与云端配置应在每次排查时重新读取。

- Card 入口为本文的外层 Agent Card；检查 `supportedInterfaces[].url`。本次失败条件是登记 origin `https://agent.sandaii.cn` 与 Card 宣告 origin `http://maxwell-agent-dev.sandaii.cn` 不同，不是 Key 无效，也不是跨 Maxwell 业务被禁止。
- 云入口在 ACK 上海集群 `c9838d6fa878b43c59a6d37586f0c0747`、namespace `maxwell` 的 `maxwell-agent-dev` Ingress。沿 ALB 监听、host 规则、后端 Service 与 `ssl-redirect` 检查实际到达应用的请求，不能仅看到入口开启 HTTPS 就推断应用生成的 Card 使用公开 HTTPS origin。
- CDN 核验入口：[基础源站](https://cdn.console.aliyun.com/domain/detail/agent.sandaii.cn/basic)与[回源配置](https://cdn.console.aliyun.com/domain/detail/agent.sandaii.cn/backSrc)。在条件规则 `api|504262688399360` 核对源站、HOST/SNI、回源协议与出站请求头，再核对 EdgeScript 是否另有改写。本次回源协议是“跟随客户端”，不能写成静态 HTTP 回源；也不能用页面静态内容的基础源站推断 API 路线。
- 已部署 Agent `7aca6b5` 的 `services/agent-server/internal/app/integration/runtime/a2a/transport.go` 与主干 `4a91b778` 对照；`requestOrigin` 使用请求 TLS/Host 及 `X-Forwarded-Proto`、`X-Forwarded-Host` 构造公开地址。已部署 EVOLVE `a158e6c1` 的凭据同源门禁同主干；仅升级主干不能证明本问题会消失。

**Why:** CDN、ALB 和应用看到的地址可能不同。Card 是客户端后续调用地址的来源；只要它宣告回源协议或回源域名，EVOLVE 就会在向该接口转发业务凭据前拒绝。正确凭据已足以读取 Card，也仍然必须满足接口同源检查。

**How to apply:** 从同一条 Card 请求沿 CDN 条件源站 → ALB/Ingress → 应用请求 origin 核对，并在可信代理边界修正公开地址传递或服务自身的公开 URL 配置。当前待实施方案是在 API 规则范围显式覆盖 `X-Forwarded-Host=agent.sandaii.cn`、`X-Forwarded-Proto=https`；按[阿里云自定义请求头文档](https://help.aliyun.com/zh/cdn/user-guide/configure-custom-request-headers/)使用“增加 + 是否允许重复=不允许”，不要误选用于正则操作的“替换”。保留实际回源 Host `maxwell-agent-dev.sandaii.cn` 以匹配 ALB 路由。该方案需改后取证，不能从控制台配置推断已生效。修复后核验到达 Go 的转发头值，并重新 GET Card 确认所有接口与登记 URL 同源，再做执行器预检；最后才在 Nextplay 业务跑选定基准与用例。此次记录不代表已修改云配置、部署修复或发起 Nextplay 测试。

## 2026-09-12 五文件证据不能仅靠 Prompt 接通

继续对照主干 `4a91b778` 与部署版本 `a158e6c1` 的 `services/evolve-server/internal/modules/evolve/application/execution/contract.go:305-325,389-393` 核对：Envelope 声明 `evidence.files`，返回 TrialResult 的赋值却未传递这一字段。沿 Worker、Runtime 文件接口与 EvidenceSet 冻结路径检查，不能因 schema 有字段就认定已有 contextId+path 下载、sha256 校验和五文件持久化链路。

**Why:** 调整外层 Prompt 只能改变其输出内容，不能补 EVOLVE 的 A2A DataPart 投影、文件读取和证据保存实现。Runner 的“文件清单已返回”和评测证据“真实字节可复核”是两项不同验收。

**How to apply:** 明确两侧数据转换及文件取回契约后补实现，再验收文件存在、哈希一致、冻结后可读取及评分可追溯。目标基准可从 `targetProfile.targetRef` 或 Case 的明确输入映射，完整 SP/Skill 候选需映射到 Runner 实际要求；`cas://contentRef` 不能自动视为远端可下载资源。Nextplay 业务存在多个 Preset，必须显式选定基准，不能从业务名或候选运行 Agent 的名称推断。此次没有选定 Nextplay 基准或验证这些映射。


## 2026-09-12 同源失败后的客户端缓存与重试边界

部署版本 `a158e6c1` 的核验入口：`services/evolve-server/internal/app/integration/a2a/registry.go:745-769` 中 `a2aClient` 仅在 `fetchCard` 与 `NewFromCard` 均成功后赋值客户端缓存；同源检查失败不产生成功客户端，下次调用会重新获取 Card。`registry.go:319-333` 中该失败直接返回，尚未进入 SendMessage。

**Why:** 本次阻断来自失败的 Card 初始化，不需要通过重启 EVOLVE、重新登记或修改同源安全检查来清除一个并不存在的成功缓存。错误提示问题可单独沿 `services/evolve-server/internal/modules/evolve/application/execution/ad_hoc.go:66-76` 的 `AdHocDispatchFailure` 检查：其默认分支把此类 dispatch_failed 也附上 uncertain 文案；细分“尚未发送”和“发送后结果未知”是提示与错误分类改进，不是修复本次同源阻断的前置改动。

**How to apply:** 先让实际 Card 所有接口与已登记 URL 同源，读取 Card 验证后再执行预检或获准的调用；现有失败记录不会自行变成功。若下一次仍失败，以当次 Card、错误阶段和新调用证据定位，不因旧 uncertain 文案假定任务已发送，也不把本结论扩展为所有已缓存成功客户端均会自动刷新。配置同源修正和完整 Nextplay 协议/文件证据接通仍须分别验收。
