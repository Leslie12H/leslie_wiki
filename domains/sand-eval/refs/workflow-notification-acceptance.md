---
name: sandeval-workflow-notification-acceptance
type: reference
created: 2026-09-27
updated: 2026-09-27
tags: [sand-eval, testing, notifications, quality]
links: [sand-eval-quality-center-test-data, browser-impersonation-concurrent-tests]
---

# Sand Eval 流程消息验收指针

## Why

消息入库、铃铛可见、收件范围正确、点击进入有权限的题目页是四个不同的验收结果。逆向退回还需要检查上游全链路与 Sand 人员排除，不能只检查直接整改处理人。

## How to apply

使用真实测试环境业务操作触发事件；以本次任务、review、disposition 与事件时间限定收件矩阵，再逐个身份查看网页消息和点击目标。加入同空间但未参与该批次的人作为对照。兼有标注与质检权限的账号必须实测链接选择，不能仅凭角色节点存在推断落点正确。代登录查看是否修改未读状态需要与本人登录分开验收。

## 当前核验入口

- 2026-09-27 本次运行报告：`/Users/leslie/Documents/Playground/notification-test-report-20260927.md`；原始回读：同目录 `notification-test-evidence-20260927.json`。送达、排除和跳转问题及未测范围以报告为准，不能沿用为以后部署结论。
- 事件与接收人：仓库 `sand-eval/platform/backend/app/services/facts/notify_workflow.py`、`inbox_notifications.py`。
- 网页收件与已读：`sand-eval/platform/backend/app/api/inbox_notifications.py`。
- 点击目标与角色优先级：`sand-eval/platform/frontend/src/components/NotificationBell.tsx`。
- 业务触发：`sand-eval/platform/backend/quality/api/inspection/inspection_handlers.py`、`resolution/resolution_handlers.py`、`management/management_handlers.py`。
- 当前测试集成代码从 `origin/sandeval-test-only` 只读核验；发布或修复必须重新核对开发基线，禁止从测试集成分支创建开发分支。
