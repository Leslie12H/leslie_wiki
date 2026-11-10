---
name: vidmuse-satisfaction-card-feedback-lineage
type: reference
created: 2026-11-10
updated: 2026-11-10
tags: [vidmuse, satisfaction, feedback, analytics]
links: [vidmuse-ai-frontend, vidmuse-zeus, vidmuse-admin, vidmuse-feedback-driven-evolve-loop]
---

# VidMuse 满意度卡片、快评与满意率查证入口

**Why:** Agent 已发卡、用户选了分、Zeus 已存反馈、报表有有效评分是四个不同事实。卡片等待时直接发文字也可能形成无评分快评；不能看到用户反馈就算一票，也不能把同名普通单选当成官方满意度卡。

**How to apply:**

- 发卡与补发：在 Admin 的 Thread 聊天记录展开首次成片交付的原始 assistant 消息及当时读取的 `confirm-results`，分别核对实际卡片类型和 Agent 的发卡规则。不要仅依靠后续回复自述。项目内发卡次数规则属于 Agent 工作流；是否入库需另查。
- 选择与发送：从 `vidmuse.ai/apps/vidmuse/src/domain/chatMdx/satisfactionFeedback.ts` 核对有效卡片、空草稿和请求格式；结合 `component/chat-components/SatisfactionCard.tsx`、`view/ChatUI/hooks/useInteractiveCardDrafts.ts`、`hooks/useSendMessage.ts` 核对点击、普通发消息、卡片提交和二次 HTTP 请求的边界。埋点另查 `analytics/businessTracking.ts`；事件不等同于成功写库。
- 落库与列表：从 `vidmuse-zeus` 的 `UserFeedbackController`、`UserFeedbackService`、`FeedbackMapper.xml` 核对原始内容、线程字段和初始状态。Admin 的 `apps/admin/controller/admin/feedback.py` 及 `service/zeus_service.py` 提供只读按类型/Thread ID 的回查链路。不要用普通聊天文本推断存在或不存在反馈行。
- 报表：从 Admin 的 `thread_outcome_sync.py`、`thread_outcomes.py`、`OutcomeMetricDefinitionHint.tsx` 核对 Thread 归因、有效分母和计数粒度；问卷页另查 `SurveyAnalyticsPage.tsx`。快评有效分母与列表记录总量不同，NPS 问卷也有独立类型。

2026-11-10 只读样例：[Dev Thread](https://dev-vidmuse-admin.sandaii.cn/playground/thread/9874a4b1-3ccb-439b-a1f8-511f65fac61e?tab=chat) 的 16:28:24 原文含 `SatisfactionCard`；同 Thread 的快评查询仅返回 ID `869024735710533`，时间为 16:50:44（UTC+8），评分 `0`，对应直接发送的文字。后续普通单选没有第二条快评。该样例通过 Admin GET 回读，未重放提交，也不代表生产环境的配置或覆盖情况。
