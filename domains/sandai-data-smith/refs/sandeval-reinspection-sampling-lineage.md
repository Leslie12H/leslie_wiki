---
name: sandeval-reinspection-sampling-lineage
type: reference
created: 2026-09-21
updated: 2026-09-21
tags: [sand-eval, quality, reinspection, sampling]
links: [sandeval-legacy-correction-recovery]
---

# 复验抽样与停止轮次的历史继承

**Why:** “上一轮”可能是一轮完全未判断就停止的检查。直接上一轮没有不合格记录，不代表更早的不合格题已经复验；页面历史标签和抽样完整性必须分别核对。

**How to apply:** 沿 previous_task_id 展开实际检查链，按 work_unit_id 对照各轮抽样和完整送审成员，核对有效改判、退回责任与冻结样本。不用当前轮题号或不同版本 response ID 作跨轮身份。当前轮已有用户判断时，调查不应直接改冻结样本。

- 入口：`quality/application/resolution/manual_return_service.py` 的 restart；`quality/application/management/reinspection_service.py` 的重抽分支；`quality/application/inspection/review_query_service.py` 的 add_previous_items；前端 ReviewWorkspace.tsx 的 previousQueueTag。
- 2026-09-21 生产三轮链的只读事实、逐题覆盖、现场源码与修复边界：`/Users/leslie/Documents/Playground/output/prod-reinspection-sampling-20260921/report.md`。当时问题是否修复及实时状态应查当前代码和运行数据，不从该指针推断。

- Sand 分支也必须覆盖两种入口：负责人退回原质检员，以及质检员退回供应商后重新验收、交接。检查有效判断而非只读原始 verdict，避免漏掉仲裁终局；用最新明确判断决定旧不合格是否仍待验证。
- 统一规则与完整退回重提回归的开发指针：SandAI Data Smith 提交 `4e13aac42`（任务分支 `codex/reinspection-required-lineage`），`quality/application/management/reinspection_sampling.py` 与 `tests/quality/application/management/test_reinspection_sampling.py`。是否已进入测试或生产应查看 PR、Gate 和部署事实。
