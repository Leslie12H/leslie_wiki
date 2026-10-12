---
name: sandeval-orphan-card-reclamation
type: pitfall
created: 2026-10-12
updated: 2026-10-12
tags: [sandeval, assignment, reclamation, production-recovery]
links: [sandeval-space-membership-and-personal-distribution, sandeval-local-startup]
---

# Sand Eval 无空间账号持有未作答卡的回收

**Why:** 账号离开标注空间后，既有 V3 分配可以继续留在该账号下，而普通改派要求交出者仍属于任务空间。同名账号是不同身份，不能仅凭显示名转移作业。只移除活分配也不足以释放槽位：身份 guard 仍可能阻止重新分配。历史批次和任务冻结题池分别承载历史事实和待完成义务，不应一并删除。

**How to apply:** 先用生产 Leader 按账号、任务和明确的卡 ID 核查成员资格、当前持有人、冻结题池、身份 guard，以及作答、草稿、执行回执、整改、重复与质检引用。只处理经过用户确认的未开展工作范围。采用所属运营 CLI，先保存预览，再以相同计划摘要显式 apply；复用任务派题占用，保留审计、历史波次和题池，独立回读受影响与未受影响数据。Hologres 独立提交发生确认丢失时，要保留原计划和任务占用并对账，不能假定整个操作已经回滚。

- 候选代码与测试入口：[测试 PR #2381](https://github.com/world-sim-dev/sandai-data-smith/pull/2381)。动态 CI、冲突、合并和发布状态读取 PR 或对应 run；创建 PR 不代表生产执行。
- 所属流程指针：`sand-eval/docs/operations/assignment-reclaim.md`；入口 `sand-eval/platform/backend/app/cli/assignment_reclaim.py`，约束 `app/services/facts/assignment_reclaim.py`。是否已进入目标版本须重新核验。
- 2026-10-12 本次范围、只读预览、验证与执行状态：[本地回收报告](/Users/leslie/Documents/Playground/sandeval-reclaim-20261012/report.md)。业务 ID 和当时统计留在本地证据，不复制到外部 PR 描述或知识页。
- 本机 `.env` 可能指向隔离测试资源；数据库、Redis 与占用 namespace 必须与目标运行实例分别核实。需要读取云凭据并取得生产集群连接配置时，不能绕过自动审批拒绝；先完成可审核方案，再取得该凭据访问动作的明确授权。
- 普通账号与任务可见性规则见[空间成员与个人派题](sandeval-space-membership-and-personal-distribution.md)。成员缺失可解释改派资格拒绝，不能据此认定验证码或登录认证故障。

- 网络和客户端核验：Redis 若仅私网可达，应在目标生产网络执行已验证的所属 CLI，并使用运行实例的占用 namespace，不能借用测试 Redis。数据库名与计算组的组合逻辑核对 `sand-eval/platform/backend/app/infra/holo.py`，避免调用者与客户端重复拼接计算组后缀。生产回收、审计及独立回读结果仍以本地报告为准。
