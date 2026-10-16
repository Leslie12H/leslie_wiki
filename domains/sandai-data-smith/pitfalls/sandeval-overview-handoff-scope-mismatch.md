---
name: sandeval-overview-handoff-scope-mismatch
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, quality-center, handoff, source-scope]
links: [sand-eval-quality-center-test-data]
---

# Sand Eval 概览未提交与 Sand 可分配的范围差异

**Why:** 按每个持久化 scope 取最新正式批次，仍可能保留已被当前整包成员覆盖的旧分区。若概览把这份集合直接与整包冻结批次集合比较，就可能在真实交接回执存在时返回未提交；同一分支也控制是否读取 Sand 报告。不能由标签反推交接没有发生，或据此重复提交、补造分配。

**How to apply:** 先确认是空间质检还是 Sand 质检，再查当前 vendor_package 的 QHANDOFF、包内冻结依据、真实 Sand 分配及 review_task 的时间线。若交接真实存在，对比 current_annotator_batches 与汇总时 live_annotator_batches 的来源范围，按 work_unit_id 与冻结答案身份核对多余批次是否已被当前整包覆盖。修复应统一当前有效范围，保留完整性、整改接续、权限和冻结版本校验，不能只删除集合比较或信任历史交接。

代码指针：`sandai-data-smith/sand-eval/platform/backend/quality/application/management/task_detail_reader.py` 的 `read`；`task_package_state.py` 的 `package_is_current`；`submission_service.py` 的 `current_batches`、`live_annotator_batches`；`batch_allocation_service.py` 的 `options_many`。先查看当前 main 与实际部署，路径内容会变化。

2026-10-16 只读核验与本地源码复现指针：`/Users/leslie/.codex/visualizations/2026/10/16/01a14502-ea48-7a43-942f-7a694bf14be4/database-evidence.json` 与 `reproduction.json`。代码对照 main `7e8ad38562a90f07afa1c1f8b8ee5fac76356942`；独立连接回读了生产 init_warehouse，未修改生产数据。该次生产网页访问超时、历史临时 KubeConfig 已不存在，因此没有当前浏览器或部署 SHA 验收；不得把源码复现写成已经修复上线。

2026-10-16 修复实现与验收入口：[测试 PR #2559](https://github.com/world-sim-dev/sandai-data-smith/pull/2559)。概览直接复用 `live_annotator_batches`；回归包含真实整改后的精确重复作者批次、已交接 Sand 报告、供应商可见性、新正式版本使旧交接失效及来源失败透传。精确提交、本地检查与后续 CI 记录见同目录 `fix-validation.json` 和 PR；合并及发布状态须实时核对。测试分支与 main 基线冲突时，不把测试历史引入任务分支；独立分支 Gate 不代替测试 PR 合并树或测试站验收。

2026-10-16 主线交付入口：[main PR #2560](https://github.com/world-sim-dev/sandai-data-smith/pull/2560)，同一干净任务分支直接指向 main，原测试 PR #2559 保留。主线 PR 的变更范围与检查结果、独立分支完整矩阵及测试站实际验收须分别读取；任一局部绿灯不替代其余证据。
