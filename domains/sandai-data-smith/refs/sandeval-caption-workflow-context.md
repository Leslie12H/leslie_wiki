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
