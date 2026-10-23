---
name: sandeval-reassigned-batch-false-allocation-pending
type: pitfall
created: 2026-10-23
updated: 2026-10-23
tags: [sand-eval, quality, reassignment, allocation, projection]
links: [sandeval-reassigned-answer-frozen-review-conflict, sand-eval-quality-center-test-data]
---

# 转派后人员批次被误报为待首次分配

**Why:** 当前来源按人员生成批次，转派会产生新的 scope_key，但稳定工作项可能已经在原批次质检或整改中。汇总只检查新 scope 是否存在分配／报告，会把它计为可分配；详情在供应商状态为空时又可能回退到“待分配质检”。真正的首次送审准入按稳定工作项查重，因此弹窗可能正确拦截，页面标签却互相矛盾。

**How to apply:** 固定部署版本，以真实有权限负责人分别读取批次 DTO、bulk prepare 和整改处置摘要；将来源完整工作项与原冻结成员逐项对应。区分“已生成原链复验”与“存在待安排复验申请”。不要通过清除历史占用、重复首次分配或把既有报告改为通过解决显示问题；汇总与详情需展示同一准入事实及原链入口。包出错后弹窗候选人员目录为空，也不能证明没有合格质检员。

2026-10-23 纸面 14 包初始只读证据见[现场报告](/Users/leslie/Documents/Playground/sandeval-paper14-20261023/report.md)，后续恢复检查、候选验证与交付边界见[修复记录](/Users/leslie/Documents/Playground/sandeval-paper14-20261023/repair-report.md)。恢复前发现已自动生成原链后继，因此未重复 apply。代码修复与最终 Gate 沿 [PR 2807](https://github.com/world-sim-dev/sandai-data-smith/pull/2807) 核对，不将候选只读验证视为部署。

自动复验发现页也要与普通整改恢复分开：pending 执行可在已有后继检查任务后继续等待归档；若复用 mutable updated_at 的前 N 条，已派轮次与反复更新会挤占新目标。按实际目标反查后继、以不可变身份游标有界扫描，资格失败仍保留原责任；具体实现与测试沿 PR 查证。

代码复核入口：`quality/application/management/batch_allocation_service.py::options_many` 的稳定工作项准入，`package_progress_query.py` 的候选计数，`leader_query_service.py::batch_options` 的供应商状态，`frontend/src/pages/quality/management/PackageDetail.tsx` 的空状态回退。按部署 SHA 阅读，不从本地旧分支推断线上。
