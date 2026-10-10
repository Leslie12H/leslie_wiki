---
name: sandeval-space-membership-and-personal-distribution
type: pitfall
created: 2026-10-10
updated: 2026-10-10
tags: [sandeval, account, space, distribution]
links: [sandeval-roles-and-workflow, sandeval-local-startup]
---

# Sand Eval 换空间与个人派题的核验入口

**Why:** 新建供应商空间、主任务下发批次、添加空间成员、给标注员派题是不同事实。同名的两个账号不能据此认定为同一个登录身份；测试实例中找不到目标空间也不能推断生产空间不存在。

**How to apply:** 先验证生产实例，按账号主键检查空间、角色、启用状态，再分别统计供应商下发批次与个人答题分配；普通读的关键结论应由 Leader 复核。登录失败要取得实际报错，不能把任务不可见归为认证失败。换空间或改派都先确定业务目的与范围，按所属写入流程操作。

- 当前单空间与单角色模型：核对 `sand-eval/platform/backend/app/services/facts/space_membership.py`、`services/facts/roles.py` 及生产 `ev2_account_space` / `ev2_account_role` 主键；不要照搬仓储里历史“无主键”注释。
- 个人任务入口：核对 `repositories/ev3_eval.py::MY_TASKS_SQL` 的 holder 与任务空间限制；负责人看到空间批次不等于标注员已有个人题目。成员及派题步骤见仓内 `app/usage_docs/content/space-owner/manage-space-members.md` 和 `manage-space-task.md`。
- 沿用原空间的批次改派：核对 `repositories/dispatch_batch_reassignment.py::reassign`。暂停、创建人身份、版本、下发完成与无个人派题/作答/标注波次均须满足；不要直接修改 `ev2_task_space`。
- 2026-10-10 只读证据：[空间与派题报告](/Users/leslie/Documents/Playground/sandeval-space-20261010/report.md)。动态名单、空间状态和题量保留在报告，未来使用重新查询；该报告未证明登录失败原因或全部改派前置条件，也未执行生产修复。
- 相关规则：[角色与两侧工作流](../refs/sandeval-roles-and-workflow.md)、[本机启动与配置来源](../refs/sandeval-local-startup.md)。
