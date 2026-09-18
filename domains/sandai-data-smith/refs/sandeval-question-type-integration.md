---
name: sandeval-question-type-integration
type: reference
created: 2026-09-18
updated: 2026-09-18
tags: [sand-eval, question-types, ci, migrations]
links: [sandeval-retired-task-links]
---

# Sand Eval 新题型分支集成检查指针

**Why:** 题型自身测试通过不代表已接入平台。2026-09-18 将 main 回合 test 时，Platform Gate 发现已合并题型缺少 metadata seed、声音能力预期和声明预算清单，见 [PR #1354](https://github.com/world-sim-dev/sandai-data-smith/pull/1354) 及其首次失败的 Gate。

**How to apply:** 每次同步重新核验源提交与 Gate，不能以“已经进 main”替代测试证据。新增 YAML 题型需检查以下当前代码入口；不改历史迁移，不扩展声明预算位以消除报错。

- seed 覆盖及唯一名：`sand-eval/platform/backend/tests/test_schema.py`；后续 `_meta.sql` 需在 `app/services/schema.py` 注册 executor/表形状与 completion marker。
- seed 必须显式执行，保留运营配置且重试幂等；名称冲突需回滚并保持 pending。合并代码不代表执行了数据库迁移。
- 声音能力预期：`backend/tests/test_rule_pack_answer_schema.py`。
- 声明预算题型清单：`backend/app/rules/declaration_budget.py --update`；新增声明位仍需遵守预算门。
- 跨目录题型集成：`backend/app/rules/question_type_pr_scope.py` 与 `.github/workflows/sand-eval-platform-gate.yml`。确需保留已合并目录外文件时，记录理由并将现有例外机制限定到准确 PR/源分支/目标分支，功能测试照常运行。
