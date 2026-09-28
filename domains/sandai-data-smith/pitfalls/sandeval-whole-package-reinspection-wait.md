---
name: sandeval-whole-package-reinspection-wait
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, remediation, handoff, testing]
links: [sandeval-direct-remediation-and-batch-handoff]
---

# 整包显示已提交 Sand 不等于原质检员已有新复验轮次

**Why:** 2026-09-28 测试环境同一个 3 批 6 题包的默认退回路径中，供应商负责人退回原质检员、复检并人工验收后，整包提交成功；Sand 负责人侧的目标批次转成“待复验”，但超过用例要求的 2 分钟后，原 Sand 质检员列表仍显示旧轮次“待供应商整改”。Sand 负责人手工安排后，目标批次才出现新轮次并最终通过。该次现象证明交接成功与自动派回复验要分别核验；恢复任务未取得运行日志，根因仍未知。

**How to apply:** 测默认负责人路线时记录负责人验收、整包提交、Sand 侧退回事项、新质检轮次的时间与身份；用完整包范围核对交接，同时以原质检员实际可执行的新轮次判定自动派回。若过了约定时限仍只有负责人“安排 Sand 复验”，先保留现场并标记自动派回断言失败；手工安排可用于验证后续闭环，但不能回填为自动通过。测试样本、逐条结果和导出指针见 [直达整改核验入口](../refs/sandeval-direct-remediation-and-batch-handoff.md)。实现核验入口在 `sand-eval/platform/backend/quality/infrastructure/runtime.py::_recover_cycle` 与 `quality/application/resolution/leader_resolution_service.py::recover_supplier_handoffs`；运行和配置状态须重新查当时部署及日志。
