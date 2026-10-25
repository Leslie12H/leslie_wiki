---
name: sandeval-package-return-uncertain-writer
type: pitfall
created: 2026-10-25
updated: 2026-10-26
tags: [sand-eval, package-return, recovery, audit]
links: [sandeval-termination-historical-writer-recovery]
---

# 整包退回待恢复：历史未知写入也会挡住轮次切换

**Why:** “整包退回尚在恢复”只说明原请求对应的轮次切换尚未完成，不能解释具体卡点。等待中的登记可能来自数日前的未知写入；旧 Pod 不在了也不等于当时业务写入成功。“0/N 批已验收”是新自查验收进度，不是答案丢失数量。

**How to apply:** 从包的 SourceTaskRef 同时定位真实来源屏障与 `package-return:` 协调记录，分别读取状态、revision、参与者、异常操作与正式退回决定。先核对原操作结果和执行器/SQL 排空，再在明确生产恢复授权下沿原生 operator 对单一登记 dry-run、CAS apply，保留审计；之后才恢复原请求并独立检查新任务。不得清空整张锁表、重放全部历史命令或把恢复退回理解成撤销退回。

## 查证入口

- 2026-10-25 个案证据与处理顺序：`/Users/leslie/Documents/Playground/output/sandeval-return-warning-20261025/diagnosis.md`；冻结原始结果见同目录 `evidence.json`。最新个案状态需重新核对；本次仅只读诊断，未执行恢复或业务写入。
- 部署源码核对基线：`5ce4c8fa8ddb4ee355d8d7b9180ed6ee2b6ab7f8`。前端 `PackageSelfCheck.tsx` 的提示与 `resumeReturn`；后端 `package_self_check_service.py` 的 `detail`、`resume_return`、`_return_with_barrier`、`resume_committed`。
- 协调机制与原生恢复约束：`backend/app/infra/package_transition.py`、`backend/app/infra/package_control.py`、`backend/app/cli/package_controls.py`。核对调用对象究竟是来源屏障还是协调记录，不能仅按 quality_task_id 视为同一对象。
- [历史执行器恢复与证据边界](sandeval-termination-historical-writer-recovery.md)。SQLSTATE XX000 只是内部错误分类，不据此推断具体 OOM 或其他数据库故障。

## 2026-10-26 明确授权后的单条恢复

**Why:** 原生核销只撤销已证明排空的执行器参与登记，不应被当作整包退回已完成；恢复服务仍需发布正式决定并逐批生成新任务。

**How to apply:** 保存 dry-run、固定 revision 的 apply 与 reconciliation 审计；观察同一请求的自动恢复，避免重复调度。在不同生产副本回读完成回执、协调记录开放、原报告/逐项意见保全，以及实际质检员列表和详情权限后，再报告恢复完成。进行中计数不能替代最终验收。

- 本次授权、冻结计划、dry-run、apply 及独立复验的归档入口：`/Users/leslie/Documents/Playground/output/sandeval-return-warning-20261025/repair-receipt.md`；个案最新状态沿该回执和生产重新查证。
