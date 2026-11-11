---
name: feishu-engineering-agent
type: reference
created: 2026-11-10
updated: 2026-11-11
tags: [maxwell, feishu, github, codex, agent, context]
links: [maxwell, sandai-api-platform-development-entrypoints]
---

# 飞书研发 Agent 与跨渠道工作项

**Why**

在飞书讨论里直接交办，Agent 可以回读需求、补充意见和确认结论。研发工作还会延续到 GitHub PR 和 CI，因此需要独立的工作项记录来关联各处的证据、任务状态和授权。业务仓库、群和试点执行底座由用户选定。截图中的仓库和开票讨论是体验参考。

## 查证入口

- 原型设计和范围查 [DeepSeek 原型 README](https://github.com/deepseek-ai/dsh-superagent-prototype)、[领域模型](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/001-domain.md) 与 [部署文档](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/006-deployment.md)。微信原文在本次访问时触发验证，正文未读到。参考实现的 Ticket、外部话题与执行 Session 各有生命周期。
- 飞书事件订阅、群历史、文档授权分别查 [长连接](https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-subscription-configure-)、[群聊及话题历史](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list) 和 [云文档能力](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/docs)。触发权限、群历史权限和文档可见性分别核对。收到 @ 事件只证明有这条消息；以应用身份读群历史还需确认机器人入群和群消息权限。
- Maxwell 仓库从 `docs/operations/chat-gateway.md`、`docs/architecture/agent-server.md` 的 Chat 章节，以及 `apps/studio/src/pages/docs/content/tools/channels.md` 查渠道配置。原生 `platform` 的当前渠道读取沿 `services/agent-server/internal/modules/chat/application/capabilities.go` 查授权，再到 `services/chat-gateway/internal/feishu/message_history.go` 查飞书 API 调用。显式引用的飞书文档和 GitHub 仓库工具查 Studio 的 `tools/feishu.md`、`tools/github.md`。
- 多人、多话题归属查 `services/agent-server/internal/modules/chat/contract/types.go` 的 `InboundEvent.ScopeID`，区分选中话题后按需读取的范围与 Runtime Thread 复用的范围。查 `services/chat-gateway/internal/gateway/gateway.go` 的群白名单和 @ 过滤，核对空白名单、@全员和私聊的实际行为。
- PR 跟进和 CI 可查 [GitHub Webhook 事件](https://docs.github.com/en/webhooks/webhook-events-and-payloads) 与 [GitHub App 权限](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)。接续时同时校验仓库、PR 与 head SHA。归属不明确的事件进入人工选择，避免按群、关键词或分支名推断写入目标。

## 本地 Codex 作为执行器

2026-11-10 补查公开原型的 [运行装配](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/src/app/runtime.ts#L128) 和 [执行说明](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/main/docs/003-execution.md)。公开版装配的是 DeepSeek Harness 的 `DshExecutor`，用 DSH Session 跑 Router 和每个 Ticket 的 Worker。Worker 能执行本机命令。通过命令再委派给其他 CLI 属于另行集成，截图无法确认本机部署有没有这种定制。

**How to apply**

以本地 Codex 为执行核心时，可在 Mac 上独立运行飞书接入和任务调度进程。接入层回读授权话题，调度层持有工作项、允许的仓库和操作范围，Codex 在对应工作区处理代码。按工作项保存准确的 Codex Thread ID、工作区和来源绑定。新任务启动独立会话，后续飞书消息或 PR 事件用该 ID 续跑，禁止用最近一次会话猜归属。不同工作项可并行，同一工作项的修改串行。发消息、推送和 PR 创建交由受控的交付步骤。

首个本机试点可用 `codex exec --json` 捕获 `thread.started` 和终态，按明确 ID 执行 `codex exec resume`。需要嵌入式调用可选 Codex SDK；需要在运行中追加输入或中止时，查 App Server 协议。公开 DeepSeek 原型可供参考工作项与 Router 设计，Maxwell 也可作为日后复用的渠道层。本轮仅核对本机 CLI 命令和文档。 [Codex 非交互模式](https://learn.chatgpt.com/docs/non-interactive-mode) · [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk#typescript-library) · [Codex App Server](https://learn.chatgpt.com/docs/app-server#api-overview)

## DeepSeek 公开原型源码复查

2026-11-10 核对 [`8c32a9dc` 源码](https://github.com/deepseek-ai/dsh-superagent-prototype/tree/8c32a9dc5d72c033816c6a8110b37f40cf94fba4)，包括核心状态机、两种来源、执行和回复实现，阅读关联测试。运行证据需另做联调。

- 工作项归属查 `src/core/intake.ts`、`src/core/evals.ts`、`src/core/tickets.ts`。Trigger 去重后先向订阅者分发；关联仅供找证据，订阅决定后续消息去哪。Worker 可把超范围的追问交回路由。普通结束和人工停止具有不同的续作条件。
- 触发和取上下文查 `src/sources/feishu-trigger.ts`、`feishu-loops.ts`、`feishu-read.ts`。消息 ID 负责去重，群和根消息负责归属；实时流、历史补读和订阅轮询使用同一事件身份。保留授权来源与分页边界，后续按工单订阅读取，无需每条回复都 @。
- GitHub 查 `src/sources/github.ts`、`github-pull.ts`。通知、已绑定 PR 的评论和当前 head 的 CI 状态由轮询驱动。PR 绑定验证来源 PR 或智能体身份及分支归属；首次 CI 观测建立基线。独立版本可由交付进程记录准确的 PR 回执。
- 工作授权查 `docs/002-authorization.md`、`src/policy.ts`。推断式接单分关闭、仅观察与自动执行。上下文订阅不会扩大 Mandate。独立版本的写操作在执行前按当前授权与目标复核。
- 恢复查 `src/core/ports.ts`、`src/executor/dsh.ts`、`src/app/outbox.ts`、`src/sources/feishu-channel.ts`。Assignment 的输入投递、运行和外部回复有不同回执。回复持久化后重试，飞书用幂等键，GitHub 评论用标记回查。
- 宿主边界查 `src/app/runtime.ts`、`src/app/sessions.ts` 和 `docs/006-deployment.md`。领域层有 Executor 端口；实际装配还绑定 DSH Session、工具、事件和生命周期。原型的账号包装和独立工作目录不构成进程隔离，部署文档声明两类 Session 均以操作系统用户的全权限运行。

**How to apply**

以原型的事件去重、工单订阅、授权和可恢复交付为参考。首版可用确定性的工单路由与独立 Codex 执行适配器。飞书话题、工作项、Codex 会话三种标识分别记录；收到消息后先区分可见性、既有任务的上下文和发起新动作的授权。个人工作机的试点优先用专用执行身份、最小凭据和隔离工作区。

## 本机试点验证入口

2026-11-10 建立独立项目 `~/Downloads/sandai-code/feishu-codex-agent`。验收入口见项目 README、`pnpm test` 与 `pnpm demo --real`。真实 Codex 两轮验证使用模拟飞书事件与合成 Git 仓库，分别查代码、按准确会话 ID 续跑。专用机器人与私有测试群已创建。飞书长连接先连通，群历史读取另报 230027，经用户确认开通 `im:message.group_msg` 后预检通过。真实话题首轮 @ 与第二轮无 @ 追问均调用本机 Codex，SQLite 记录同一工单的两条成功回复，飞书话题回读均可见。试点群、应用、工作项和交付状态沿项目 `config.json` 与 `.state/` 回查。

**Why**

一台机器的 PATH 可能同时命中较旧的 Homebrew 二进制和动态解析 latest 的 CLI 包装器。版本差异会改变 `--content -`、dry-run JSON 和事件输出。Codex 的 `exec` 与 `exec resume` 也有各自的参数集。

**How to apply**

固定并验证可执行文件路径和版本，用回复 dry-run 检查请求体、bot 身份和幂等键。真实模型烟测至少覆盖新建和续跑两轮，避免把首轮成功当成接续成功。用只读权限配置对照验证仓库内可读、仓库外拒绝。凭据和租户状态从专用 lark-cli 配置与飞书开放平台回查。

## 试点顺序

1. 用一个获授权的测试群和一个只读仓库，验证机器人能从当前话题中还原前文、区分已确认结论与待确认项、查到代码依据并在原话题回复。用权限不足、不同话题和重复事件做对照。
2. 用稳定工作项 ID 关联飞书话题、PR、执行 Thread 与 GitHub 分支。可让同一话题存在多个工作项，后续消息按明确绑定续作，歧义时请人选择。写操作由本次请求、操作者和仓库策略共同授权，历史消息、文档、PR 评论正文和 CI 日志按证据处理。
3. 有写权限后先跑单个工作项的隔离工作区、测试、Draft PR 和原话题回执。PR 评论接续通过后再加已绑定 PR 的 CI 失败诊断。先观察诊断是否准确，再启用有次数上限且复核当前 head 的修复提交。

**How to apply**

先证明飞书上下文能改善一次真实交办，再扩大到工作项并行和跨渠道写入。分别验证同一人发起两件事、不同人补充同一件事、重放同一事件、旧提交的 CI 结果迟到。回复用可回查来源，先核对目标话题、目标 PR 和结果受众。撤回试点时先停入口，再检查在途任务与外部回执。

2026-11-10 在 Maxwell 本地 checkout `863b9acfc` 执行 `GOCACHE="$PWD/.tmp/go-cache" go test ./services/chat-gateway/internal/feishu ./services/chat-gateway/internal/gateway ./services/agent-server/internal/modules/chat/...`，退出 0。此记录只证明现有渠道包测试通过。试点应用、群历史权限、仓库授权及真实消息链路待核验。

## 跨 Codex 会话跟进的授权边界

2026-11-11 核对本机试点的 `src/agent.mjs`、`src/index.mjs` 和 `src/adapters.mjs`。试点的会话绑定来自机器人自己的工单，仓库和飞书群来自运行配置。用户引用已有 Codex 会话时，判断依据应来自该会话与指定仓库。示例仓库的代码无法回答业务仓库的具体问题。

**Why**

读取已有会话、在已有会话追加一轮、把结果发到飞书是三个独立动作。跟进完成状态还需要约定结束条件，单轮结束只证明该轮有结果。

**How to apply**

从 [Codex App Server](https://learn.chatgpt.com/docs/app-server#api-overview) 查会话发现、只读回读、恢复会话和事件入口。可以按已授权项目或会话定位来源，只读获取必要信息并绑定到飞书话题。需执行改动时按任务授权绑定仓库和执行环境，通知以约定的完成证据为准。参考 [DeepSeek 原型的工单授权](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/8c32a9dc5d72c033816c6a8110b37f40cf94fba4/docs/002-authorization.md)。

用本机 App Server 的 `thread/read` 和 `thread/turns/list` 按已知 ID 只读查到原合成试点会话的两轮记录。该探针验证本机读取接口，飞书接入与项目授权属于后续实现。

## 本机执行权限模式

2026-11-11 用户明确授权试点以当前 macOS 用户的完整本机权限运行。配置和回滚查独立项目 README 与 `config.example.json`，执行参数和提示词查 `src/adapters.mjs` 与 `src/agent.mjs`。权限开关加载后保留原工作项和会话绑定，飞书入口按现有群和用户授权工作。

**Why**

原试点的只读沙箱和提示词同时限制跨目录与已有会话。切换本机权限时应同时检查执行参数和提示词，避免两层状态不一致。

**How to apply**

确认运行中的服务输出权限模式和飞书就绪状态，再用合成数据对照验证。2026-11-11 真实 Codex 适配器成功读写初始仓库外的临时文件，访问本机 HTTP 端点，并回读原合成试点会话的两轮记录。日后用同样方法复查，不从历史记录推断当前开关状态。
