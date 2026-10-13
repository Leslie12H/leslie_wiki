---
name: sandeval-manual-batch-reset
type: reference
created: 2026-10-13
updated: 2026-10-13
tags: [sandeval, assignment, manual-recovery, audit]
links: [sandeval-orphan-card-reclamation, sandeval-partial-assignment-recovery]
---

# Sand Eval 整批手动恢复到未派题

**Why:** 任务名称中的总题数可能来自母包，带后缀的实际子批次需要从冻结题池和主任务条目核实。恢复到未派题不能仅清空持有人或移除答题卡；身份 guard 仍可能占用槽位，而已有答案字段和执行回执可能影响重新派题及请求重放。有答案的整批归零与未开展工作的卡回收是不同授权范围。

**How to apply:** 只有明确授权整批归零时，才将已有答案纳入受控归档范围。先使用当前运行实例的生产配置和 Leader 核实精确 task ID、题池、卡、guard、全部答案版本及字段、草稿、执行回执和质检/整改/模块引用；实时作答期间的早期快照不能代替执行快照。默认只读预览，显式 apply 同一快照摘要，复用任务派题占用与每名当前持卡人的 annotation-handoff 写入锁。写入前保存并读回验证完整可恢复归档，按冻结主键独立提交，保留题池与历史派题事实，最后以独立 Leader 和正式任务读取路径验证。Hologres 不提供此类多语句整体回滚；中断后先核对归档及现状，不盲目重放。

- 2026-10-13 授权、精确范围、执行脚本、快照归档、完成记录和独立核验：[本次恢复报告](/Users/leslie/Documents/Playground/output/wuzijie-09-unassign-20261013/report.md)。动态业务 ID、数量和生产 SHA 仅保存在该证据目录。
- 该目录的 operator_full.py 是本次任务专用工具，未形成通用产品能力；不能将其任务常量替换后直接复用。
- 当前派题占用与生产写入协议：仓库 sand-eval/docs/operations/assignment-recovery.md、platform/backend/app/infra/assignment_operations.py。
- 持卡人写入锁：platform/backend/app/api/annotation_write_gate.py；答案及回执：app/repositories/ev3_write.py、answer_execution.py；历史波次：app/repositories/assignment_wave.py。
- 未作答卡回收另见[无空间账号卡回收](../pitfalls/sandeval-orphan-card-reclamation.md)，部分派题继续原计划另见[原计划恢复](sandeval-partial-assignment-recovery.md)。
