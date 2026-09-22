---
name: ci-scope-and-indirect-gates
type: discipline
created: 2026-09-22
updated: 2026-09-22
tags: [ci, testing, dependency, sand-eval]
links: []
---

# 收窄 CI 时检查间接门禁

**Why:** 删除 workflow 中的文档 job 并不等于业务 CI 不再依赖文档：分类器可能读取文档清单以推导变更范围，生成物检查也可能通过依赖图先执行目录、预算等检查。只看 Actions job 数量会遗漏这些间接阻塞。

**How to apply:** 从路径分类默认值、job 条件、步骤条件和检查器依赖图四层核对。运行时生成物与文档生成物分开选择；工具自检由工具输入变化触发。为纯文档、普通业务、规则包、工具自身和未知路径保留样例，并验证选中的检查失败、取消或意外跳过仍导致聚合失败。并行 job 时长不可直接相加作为墙钟收益。

实现与当前状态只查源：

- [Sand Eval CI 收窄 PR #1621](https://github.com/world-sim-dev/sandai-data-smith/pull/1621)。合并、检查结果与部署状态以 PR 和对应 run 为准。
- 仓库 `sand-eval/platform/scripts/select_tests.py`：路径、输入与检查选择。
- 仓库 `.github/workflows/sand-eval-platform-gate.yml`：步骤条件与最终结果聚合。
- 仓库 `sand-eval/scripts/ai_native/run_gates.py`：检查之间的依赖。

本地 macOS 的 `/var` 与 `/private/var` 临时路径别名也可能让依赖 lexical 路径的结构夹具失败；先用规范化 TMPDIR 复核，再判断是否改坏业务代码。
