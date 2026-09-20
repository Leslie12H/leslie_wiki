---
name: sandeval-caption-workflow-context
type: reference
created: 2026-09-20
updated: 2026-09-20
tags: [sandeval, caption, workflow, diagnosis]
links: [sandeval-sql-lock-diagnosis]
---

# Caption 工作流上下文契约排查

**Why:** 2026-09-20 题目详情 500 的生产堆栈定位到 caption_refine_v6 初始化读取缺失的 modules。题型与通用服务必须核验同一运行版本，不能只读本地旧分支判断线上行为。

**How to apply:** 从题目、答题卡、时间窗找到精确异常；对照运行容器的上下文构造与工作流消费端。核查 initial 是否在已有草稿选择前无条件执行，以及职责校验是否依赖同一字段；不能用空默认值掩盖契约缺失。

## 指针

- 本次脱敏证据：`/Users/leslie/Documents/Playground/output/sandeval-caption-v6-500-20260920.md`。
- 通用执行上下文：`sand-eval/platform/backend/app/services/facts/answer_execution.py` 的 snapshot 与 _scope。
- 题型消费端：`sand-eval/platform/question_types/caption_refine_v6/backend/workflow.py` 的 initial 与 _scope；以当次线上镜像为准。
- 日志访问：`~/.codex/skills/sdh-infra-access/SKILL.md`。

该记录是历史排查指针，修复与恢复状态须重新核验。

## 引入历史核验

2026-09-20 核验 Git 与 GitHub PR：

- 前置契约变化：[7a7272e31](https://github.com/world-sim-dev/sandai-data-smith/commit/7a7272e31388432e7e3e76569f308fd14deffccb)，2026-09-17 22:41:39 +08:00，平台改为整题作答，同时移除 v3/v4/v5 对 modules 的消费。
- 不兼容依赖引入：[bd19eca67](https://github.com/world-sim-dev/sandai-data-smith/commit/bd19eca67d2cbe4c85a451adafc5fadf26728b1f)，2026-09-19 23:23:40 +08:00，新增 v6 的 initial/_scope 仍读取 context modules，父版本的平台已不再提供。
- 主线合入：[PR #1446](https://github.com/world-sim-dev/sandai-data-smith/pull/1446)，2026-09-20 00:46:16 +08:00，merge 6d9b0b8d7。此为合入时间，不能代替首次生产上线时间。

## 修复验证入口

2026-09-20：本地候选 `c02848017`（`codex/caption-v6-whole-question-fix`），工作树 `/Users/leslie/Documents/Playground/caption-v6-whole-question-fix`。将 v6 工作流、编辑器、内容目标、派发策略和交付对齐既有整题契约；按帧精度与质检角色约束保留。PR、Gate 和上线状态需另查。

回归易漏点：题型单元测试若手工补齐 modules，会掩盖通用执行服务没有该字段的事实。验证应通过 AnswerExecutionService 的真实上下文，至少覆盖打开、保存、重开和提交；同时检查编辑器没有因缺少 modules 把整题置为只读。题型保存数据的源封套与稳定目标不可为了移除运行时分工而重写。

本地证据位置：`/tmp/caption-v6-targeted.log`（105 项直接后端回归与 42 项投影检查）、`/tmp/caption-v6-frontend.log` 和 `/tmp/caption-v6-frontend-recheck.log`（类型检查、43 个相关前端文件通过与 v6 文件 36 项复测通过）、`/tmp/caption-v6-gates.log`（9 项结构门）。临时文件仅作当次证据；完整验证仍由 PR Gate 承担。

## 生产兼容性核验入口

2026-09-20 对候选 c02848017 的派发策略补查发现真实存量不兼容，之前“无阻断代码问题”不代表可以直接发布。证据：`/Users/leslie/Documents/Playground/output/caption-v6-production-dispatch-audit-20260920.md`。该文件记录两次生产独立读取与新代码实际校验结果；实时数量、配置和迁移状态应重新查询。

**Why:** 给现有题型增加 dispatch_policy 会追溯校验旧草稿和冻结发布配置，而旧任务创建时可能合法地保留 unlocked 默认值。

**How to apply:** 发布前读 eval_dispatch_master 的 draft_config/frozen_config，并对 ev2_task 的 assignment_count_locked/locked_annotators_per_question 做交叉核对。通过候选 MasterConfig 与真实策略校验定位受影响入口；不要把派发校验失败误说成已有单题作答被阻断。500 修复应与新限制隔离，或先完成受控的历史兼容方案；未授权不迁移生产。
