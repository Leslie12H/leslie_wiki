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

- 2026-09-25 案例、精确时间线与用户授权后的单批手动恢复记录：`/Users/leslie/Documents/Playground/output/quality-allocation-20260925/report.md`。完整备份、计划摘要、应用回执和独立验收分别见同目录 `repair-plan.json`、`repair-apply.json`、`repair-verify.json`；现场状态会变，后续操作须重新核查。
- 恢复方法指针：同目录事故限定 `repair_submission.py`，默认 dry-run，显式 apply 加计划摘要。保留已完成快照，为缺失部分读取精确原答案版本并记录新采集时间；应用时重验范围，旧值比较更新成员，验证全部正文和凭证后最后发布父摘要，再续原分配。不能把该脚本泛化到已有下游报告或聚合引用的正式送审。
- 验收边界：独立连接核对完整摘要和凭证，保护原成功批次的固定身份及成员，调用正式管理端与检查员查询服务。浏览器未登录时须明确区分服务查询证据与浏览器验收。
- 代码指针：`quality/application/management/submission_service.py::change` 的父状态/成员/凭证写入顺序，`quality/infrastructure/persistence/unit_of_work.py` 的实际事务模式，`submission_repository.py::put_items` 的批量 upsert，以及 `batch_allocation_service.py::_submission` 的重试状态分支。
- 校验入口：`assignment_service.py::create` 的 member_hash 比对、`SubmissionService.evidence_key` 对应冻结凭证。
- 发布/停机证据入口：`platform/k8s/start.sh::shutdown`、`force_stop_child` 与 SLS 中同 Pod 的 Kubernetes 事件。事故日志查询选发生时的集群，当前生产入口另行核验。
