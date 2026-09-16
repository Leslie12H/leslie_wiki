---
name: monitoring-problem-claim-replies-to-historical-alerts
type: pitfall
created: 2026-09-15
updated: 2026-09-16
tags: [vidmuse, admin, monitoring, feishu, clustering]
links: [monitoring-problem-title-vs-incident-report, tool-errors-bootstrap-and-analytics-memory]
---

# 认领 Problem 可能在已恢复的历史告警话题中新发卡片

**Why:** Problem 是跨 Incident 的问题对象。2026-09-15 的生产只读调查确认，一次飞书卡片人工认领生成了新的 `problem_status_changed` 活动，并向这个 Problem 关联的历史告警话题发送卡片。旧告警发生日期与新消息发送日期属于两条不同的时间线，不能仅凭卡片中出现旧日期就归因为消息积压。

该案例有三个叠加因素：

1. 自由文本报告未归一到单一故障机制时，候选按 `review:{aggregation.group_key}` 形成 `unclassified_report` 弱聚类，标记低置信度及 `needs_review`。同一 Problem 的关联并不证明同一根因；现场关联的报告涉及积分确认、文件格式、文件名过长、应用不存在和非法 Cookie 等不同机制。
2. Problem 认领动作没有绑定 `incident_key` 时，状态活动遍历全部实际关联的 Incident；该路径没有按告警日期或已恢复状态过滤。维护 reconciler 有单独抑制通知的分支，不能把所有历史话题消息都归因于后台修复。
3. SLS 原始话题根消息由外部告警机器人所有，Admin 只能维护自己的回复。没有找到可复用的既往 Problem 卡片时，会在旧话题中新发回复。展示投影中 `needs_review` 优先于负责人已设置，卡片标题仍可能显示“待审核是否建 Bug”，且没有明确解释本次认领变化，容易被理解为旧告警重新触发。

**How to apply:** 遇到“旧告警今天突然发”时，先分别核对原始告警时间、人工动作时间、活动创建时间、首次发送时间及飞书消息创建时间，再按下列关联键追溯：

1. 从 `incident_key` 查 Incident 生命周期及原始通知记录，确认是否确有新的告警事件。
2. 查 `MonitoringIncidentActivityOutbox` 的 `kind`、`event_key`、创建/发送时间、尝试次数和消息回执。新建活动几秒后首次成功不能解释为旧队列长时间重试。
3. 用同一 `event_key` 找 `MonitoringProblemAction`，核对 action、actor 类型以及是否绑定 `incident_key`。不要仅凭当前负责人字段猜测是谁在何时触发。
4. 从 `MonitoringProblemIncident` 读取真实关联，再检查每个 Incident 当次报告。Problem 的缓存关联数不能替代真实 links 或实际生成的活动数，弱聚类也不能直接作为同根因证明。
5. 回读飞书消息及 root/thread 的关系，区分编辑已有卡片、新建话题回复和新告警根消息。核对源码时同时记录版本；本地源码审查不等于生产运行版本已验证。

## 2026-09-15 案例追溯指针

以下是一次已发生事件的证据定位，不作为当前队列或 Problem 状态快照：

- Incident：`sls-incident-b5d01bbacae6757b73d84a1e28e2f8e5af7beb5b`；原始告警时间为 2026-08-21 09:47:51（北京时间），回查时已恢复。
- Problem：`prb_905b31adec59491f8558536a`；Action ID `4586` 为人工 `claimed`，2026-09-15 19:42:42（北京时间）触发活动；Activity ID `30144` 在 19:42:48 首次发送成功。该证据排除了这条消息由旧通知队列积压、此次新 SLS 触发或 reconciler 动作直接生成。
- 关联事件：`feishu-card:de1cb96aa0d96fd970dcde932fa10ea2e217d24ce4d4d49a1e695128ebf2c761`。用该键串起动作及同批活动，不以 Problem 缓存关联数推算通知范围。
- 飞书新回复：`om_x100b65a6bdb56ca8c32bdfcd48b4a66`；原始告警 root：`om_x100b674eaa4064a8c2ff42001167c99`；话题：`omt_19e22681f88f9b83`；群：`oc_a31e9e45e2594645c21954573619231f`。
- 生产页面：[Monitoring Incidents](https://prod-vidmuse-admin.vidmuse.ai/playground/admin/monitoring-incidents)。现场证据来自生产 DMS 只读查询和飞书消息回读，未解析或保存人工操作者的个人身份。

## 源码核验入口

首次诊断基于本地 `origin/main` 缓存提交 `412e4be3f9c3ddd7aaf065bd165bfca8398c25bb`，当时未实测生产 SHA、未实施修复。以下固定版本链接用于定位原行为；后续修复见下方 PR 入口：

- [卡片动作入口](https://github.com/world-sim-dev/vidmuse-admin/blob/412e4be3f9c3ddd7aaf065bd165bfca8398c25bb/apps/admin/service/monitoring_problem_card_action.py)：Problem claim 与 Incident claim 的范围差异。
- [Problem 动作服务](https://github.com/world-sim-dev/vidmuse-admin/blob/412e4be3f9c3ddd7aaf065bd165bfca8398c25bb/apps/admin/service/monitoring_problem.py)：`claim` → `_record_action` → `enqueue_problem_status_activity`。
- [状态活动生成](https://github.com/world-sim-dev/vidmuse-admin/blob/412e4be3f9c3ddd7aaf065bd165bfca8398c25bb/apps/admin/service/monitoring_problem_activity.py)：是否绑定 Incident、遍历关联及 reconciler 通知抑制。
- [话题通知发送](https://github.com/world-sim-dev/vidmuse-admin/blob/412e4be3f9c3ddd7aaf065bd165bfca8398c25bb/apps/admin/service/monitoring_incident_thread_notification.py)：外部 root 的历史 Problem 回复查找、回执一致性与新回复分支。
- [弱聚类候选](https://github.com/world-sim-dev/vidmuse-admin/blob/412e4be3f9c3ddd7aaf065bd165bfca8398c25bb/apps/admin/service/monitoring_problem_candidate.py)：自由文本报告的 review scope 与低置信身份。
- [人工状态投影](https://github.com/world-sim-dev/vidmuse-admin/blob/412e4be3f9c3ddd7aaf065bd165bfca8398c25bb/apps/admin/service/monitoring_problem_projection.py)：`needs_review` 与 assignee 的展示优先级。

## 修正时的验收边界

若后续调整产品规则，需要同时决定弱聚类 Problem 的操作范围、历史已恢复话题是否允许新回复，以及卡片如何明确呈现本次状态变化。分别验证单 Incident 操作和全 Problem 操作，避免仅隐藏卡片日期而保留跨机制广播。建议规则不代表已经实施或部署。

## 2026-09-15 修复与评审入口

[PR #881](https://github.com/world-sim-dev/vidmuse-admin/pull/881)，提交 `28b0995e8312b6dc4e3d55f90d8d89f00c45f069`，分支 `codex/fix-monitoring-claim-tool-errors`。2026-09-15 已完成本地实现与回归，未合并、未部署；PR 后续状态以链接为准。

- `validate_card_binding` 从精确消息回执识别唯一来源 Incident，将该来源沿卡片回调、认领/释放/转交动作及幂等动作写入审计。界面传入的 Incident 与已验证来源不一致时拒绝执行。
- 卡片归属变化只通知已验证的来源话题；无来源话题的管理页归属动作保留审计，不向历史关联广播。Bug/验证状态变化的既有广播策略单独保留，避免把两种操作范围混为一谈。
- 成功回调从同一来源 Incident 读取告警上下文，不再从 Problem 的第一个关联推断来源。卡片明确展示“本次变更”，并提示弱聚类认领不代表已确认共同根因。
- 旧版本卡片先验证唯一消息来源，再读取当前 Problem 版本。旧卡只刷新该来源话题的当前状态并提示重试，不执行旧命令或生成新通知；来源不匹配、无法绑定或未来版本均拒绝执行。查看 `MonitoringProblemCardActionService.handle` 及卡片回调回归，不能用“版本过期”跳过来源验证。
- 验证入口：`apps/admin/tests/test_monitoring_problem_card_action.py` 和 `test_monitoring_problem_service.py`；联合 11 个后端测试文件通过 461 项。后续异步 LLM 调整的影响测试另行通过，完整边界见下方关联页；以上不代表生产旧卡和消息发送已经复验。
- 相关页面启动与内存风险的独立核验方法见 [Tool Errors 启动与 Analytics 内存](tool-errors-bootstrap-and-analytics-memory.md)。

## 2026-09-16 部署复查：新入队规则不等于清理旧队列

**Why:** PR #881 的通知范围限制发生在新 Action 生成活动时。[入队规则](https://github.com/world-sim-dev/vidmuse-admin/blob/28b0995e8312b6dc4e3d55f90d8d89f00c45f069/apps/admin/service/monitoring_problem_activity.py#L59) 会约束新归属动作，并按来源 Incident 收窄关联；已经持久化的 pending / retry_scheduled 活动不会因此被撤销。[发送器候选查询](https://github.com/world-sim-dev/vidmuse-admin/blob/28b0995e8312b6dc4e3d55f90d8d89f00c45f069/apps/admin/service/monitoring_incident_thread_notification.py#L721) 检查队列状态、可发送时间、话题根回执和前序阻塞，没有重新按归属 action、来源范围或历史恢复状态过滤。旧活动仍可能在新版本上线后发送；这是源码允许的路径，不是本次已证实的重发原因。Bug/验证生命周期仍保留原有广播范围，查看 [卡片验证入口](https://github.com/world-sim-dev/vidmuse-admin/blob/28b0995e8312b6dc4e3d55f90d8d89f00c45f069/apps/admin/service/monitoring_problem_card_action.py#L166)，不要将归属限制解释为禁止所有历史话题通知。

**How to apply:** 部署后再次收到类似卡片时，先取得具体消息 ID 或话题链接；通用 `issue/create` 入口不能定位一次发送。用消息回执找到 outbox，再比较 Action 创建、活动创建、首次发送/重试时间与实际部署时间，并核对 action 类型和来源 Incident。由此区分“旧活动部署后才发送”“新归属动作错误广播”“保留的 Bug/验证通知”和“只是看到原消息”。仅有部署成功记录不能证明队列已清理；没有定位新消息时不能判为复发，也不要推断必须清队列。

2026-09-16 的只读复查定位：

- [PR #881](https://github.com/world-sim-dev/vidmuse-admin/pull/881) 于北京时间 10:49 合并，合并提交 `d5f8fe4b`；[生产部署 run 35051481896](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35051481896) 于北京时间 11:27:15 成功。后续版本与发布状态以 PR/run 为准。
- 原 2026-08-21 告警话题 `omt_19e22681f88f9b83` 完整回读得到 14 条、`has_more=false`；当次回读最新仍为 2026-09-15 19:42 的 `om_x100b65a6bdb56ca8c32bdfcd48b4a66`，未见 2026-09-16 新增。用户提供的是通用创建入口，尚未定位新的发送记录。此结论只覆盖当次读取的该话题，不代表所有话题或未来消息均无异常。
