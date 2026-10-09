---
name: sandeval-direct-return-interrupted-by-leader
type: pitfall
created: 2026-10-09
updated: 2026-10-09
tags: [sand-eval, quality-center, direct-return, inspector, reinspection]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-return-route-and-handoff-hints, sandeval-repeated-correction-ancestor-blocker]
---

# Sand 直接整改后负责人再次退回造成旧轮次只读

**Why:** Sand 的直接整改先由系统代供应商负责人委派原质检员。负责人再次退回已派出的轮次会停止当前检查；若后继重检沿用原送审的过期配置快照，严格版本门禁会拒绝新计划，留下“旧轮次停止、新轮次缺失”。界面“待质检员整改”不能证明链接中的任务可写，也不能单凭系统委派 created_by 把首次委派归为负责人真人操作。

**How to apply:** 固定质量任务、review_task_id、attempt、previous_task_id 和部署 SHA，依次核对 Sand route、系统子处置与负责人独立 manual_return。按人员公开能力和线上 detail / check_blockers / assert_returnable 确认状态与阻断；创建缺失时同时核对原送审、原轮次、新内存计划及当前配置的版本与规则。读取与授权通过不等于新计划已持久化；退回事实先保存、重检异常后捕获时，HTTP 200 也不代表重检成功。只读复现必须替换全部写入边界并开启 DML 拒绝，不能试探真实 restart/recover。恢复应保留 stopped 历史，经规则兼容校验后创建新轮次，不能改写历史快照或放松版本门禁。

- 2026-10-09 孔一凡/姜子涵个案的生产只读时间线、执行脚本、人员资格、部署版本、明确拒绝码和后继缺失证据：[取证报告](/Users/leslie/Documents/Playground/sandeval-return-blocker-20261009/report.md)。实时对象与方法在该目录 read_runtime.py；具体人员、状态、轮次与运行版本必须重新读取。
- 2026-10-09 排查阶段通过部署代码的只读替身确认创建门禁失败；根因链、配置版本、SOURCE_SCOPE_CHANGED、事发与当前部署对照、未捕获原响应体的证据边界见取证报告。用户随后授权代码修复，实施及 CI 状态见[修复记录](/Users/leslie/Documents/Playground/sandeval-return-blocker-20261009/repair.md)；生产恢复与发布须另行核验。
- 用户在 2026-10-09 授权修复直接整改重复退回与手动重检配置问题。实现共用后端资格限制，保留质检员退回标注员及分派前负责人接手；配置迁移复用标准重检的规则兼容校验，并保留严格持久化门禁。重新核验业务决策入口：sand-eval/knowledge/DECISIONS.md 的“Sand 退回可选「退回质检员/标注员」”条目。查询和命令应共用后端资格限制，仅隐藏按钮不足以约束调用。
- 源码指针：quality/application/resolution/manual_return_service.py 的 assert_returnable / submit / _return / restart / recover；quality/application/management/reinspection_service.py 的 _create；quality/domain/management/submission.py 的 source_scope_migration；quality/infrastructure/persistence/scope_fence.py 的 seal_scope / scope_insert_guard；leader_query_service.py 的 return_to_reviewer 投影。初始系统委派走 direct_return_service.py 与 leader_resolution_service.py；页面状态走 review_query_service.py。
