---
name: sandeval-direct-return-interrupted-by-leader
type: pitfall
created: 2026-10-09
updated: 2026-10-09
tags: [sand-eval, quality-center, direct-return, inspector, reinspection]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-return-route-and-handoff-hints, sandeval-repeated-correction-ancestor-blocker]
---

# Sand 直接整改后负责人再次退回造成旧轮次只读

**Why:** Sand 的直接整改先由系统代供应商负责人委派原质检员。后续负责人还可能独立再次退回新生成的质检轮次。两次退回属于不同关卡和责任，且后一次会停止当前轮次；界面“待质检员整改”不能证明链接中的任务可写，也不能单凭系统委派 created_by 把首次委派归为负责人真人操作。

**How to apply:** 固定质量任务、review_task_id、attempt、previous_task_id 和部署 SHA，依次核对 Sand route、系统子处置与负责人独立 manual_return。按人员公开能力确认当前身份，再用线上 detail / check_blockers / assert_returnable 的只读投影确认 status、available_actions、阻断处置和下一轮。保留 stopped 历史，恢复应走后继重检创建，不能把旧报告直接改回 active。生产授权和来源证明通过也不等于后继计划已持久化；HTTP 200 只证明其响应描述的事实。

- 2026-10-09 孔一凡/姜子涵个案的生产只读时间线、执行脚本、人员资格、部署版本、明确拒绝码和后继缺失证据：[取证报告](/Users/leslie/Documents/Playground/sandeval-return-blocker-20261009/report.md)。实时对象与方法在该目录 read_runtime.py；具体人员、状态、轮次与运行版本必须重新读取。
- 本次下一轮缺失的具体创建失败点尚未确认；来源 proof、原计划、授权与抽样准备检查通过，未实施生产恢复或业务代码改动。
- 源码指针：quality/application/resolution/manual_return_service.py 的 submit / _return / restart / recover；quality/application/inspection/review_query_service.py 的 detail / _continuation；review_service.py 的 check_blockers。初始系统委派走 direct_return_service.py 与 leader_resolution_service.py。
