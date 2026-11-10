---
name: feishu-engineering-agent
type: reference
created: 2026-11-10
updated: 2026-11-10
tags: [maxwell, feishu, github, agent, context]
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

## 试点顺序

1. 用一个获授权的测试群和一个只读仓库，验证机器人能从当前话题中还原前文、区分已确认结论与待确认项、查到代码依据并在原话题回复。用权限不足、不同话题和重复事件做对照。
2. 用稳定工作项 ID 关联飞书话题、PR、执行 Thread 与 GitHub 分支。可让同一话题存在多个工作项，后续消息按明确绑定续作，歧义时请人选择。写操作由本次请求、操作者和仓库策略共同授权，历史消息、文档、PR 评论正文和 CI 日志按证据处理。
3. 有写权限后先跑单个工作项的隔离工作区、测试、Draft PR 和原话题回执。PR 评论接续通过后再加已绑定 PR 的 CI 失败诊断。先观察诊断是否准确，再启用有次数上限且复核当前 head 的修复提交。

**How to apply**

先证明飞书上下文能改善一次真实交办，再扩大到工作项并行和跨渠道写入。分别验证同一人发起两件事、不同人补充同一件事、重放同一事件、旧提交的 CI 结果迟到。回复用可回查来源，先核对目标话题、目标 PR 和结果受众。撤回试点时先停入口，再检查在途任务与外部回执。

2026-11-10 在 Maxwell 本地 checkout `863b9acfc` 执行 `GOCACHE="$PWD/.tmp/go-cache" go test ./services/chat-gateway/internal/feishu ./services/chat-gateway/internal/gateway ./services/agent-server/internal/modules/chat/...`，退出 0。此记录只证明现有渠道包测试通过。试点应用、群历史权限、仓库授权及真实消息链路待核验。
