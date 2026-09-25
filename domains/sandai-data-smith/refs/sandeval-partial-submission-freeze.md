---
name: sandeval-partial-submission-freeze
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sandeval, quality, allocation, recovery, hologres]
links: []
---

# 质检分配与半完成送审冻结

**Why:** 分配行的“送审清单与冻结摘要不一致”可能源于父记录先标记正式送审、成员及证据后写；进程中断后留下半完成冻结。不能把送审成员数量齐全等同于冻结内容完整，也不能把 UnitOfWork 命名或注释视作数据库原子性证明。

**How to apply:** 按指定分配定位失败 submission，对比全部成员重算摘要、每个 quality_snapshot、冻结证据回执及真实 review_task；将成员排序后的缺失分布与原实例的批量写入 span、容器终止及 ReplicaSet 事件串起来。恢复前限定无下游事实的损坏批次，保护正常批次；不能仅覆盖摘要或把新采集快照冒充历史证据。

- 2026-09-25 只读案例、精确时间线与恢复方案：`/Users/leslie/Documents/Playground/output/quality-allocation-20260925/report.md`。现场状态会变，执行修复前重新 dry-run；本次没有修复生产数据。
- 代码指针：`quality/application/management/submission_service.py::change` 的父状态/成员/凭证写入顺序，`quality/infrastructure/persistence/unit_of_work.py` 的实际事务模式，`submission_repository.py::put_items` 的批量 upsert，以及 `batch_allocation_service.py::_submission` 的重试状态分支。
- 校验入口：`assignment_service.py::create` 的 member_hash 比对、`SubmissionService.evidence_key` 对应冻结凭证。
- 发布/停机证据入口：`platform/k8s/start.sh::shutdown`、`force_stop_child` 与 SLS 中同 Pod 的 Kubernetes 事件。事故日志查询选发生时的集群，当前生产入口另行核验。
