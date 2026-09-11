---
name: evolve-pr281-dev-deployment-20260911
type: reference
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, evolve, dev, deployment]
links: []
---

# PR 281 DEV 发布证据

2026-09-11 用户指定部署已合并 PR #281 到 dev，并另行明确允许数据库迁移。发布源码为 main `c5dd348fbc18ac211cd1369a41219207ae906b05`。以下是当次验收证据，当前环境状态应重新查询。

- PR：https://github.com/world-sim-dev/maxwell-ai/pull/281
- EVOLVE 构建：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558545965
- EVOLVE 迁移及部署：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558733197
- Studio 188 构建：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558548776
- Studio 188 发布：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558832399

**Why:** PR 新后端依赖 migration 0007 的新字段、约束和优化搜索表，必须先完成迁移，再发布后端与前端。

**How to apply:** 检查部署日志的 `EVOLVE migration applied`（0007_evolve_capability_upgrade.sql）、API/Worker rollout、运行时验证步骤；再核对公开 Studio index.html 的构建目录。此次上述步骤均成功，公开 OSS index 指向 build 188；dev API 带 business header 但无鉴权返回预期 401。工作流验证包含 NAS 写入、healthz 和 authenticated MCP initialize。

部署不等于真实评测验证：本次未重跑真实 Run，未确认 agent-resources Prompt/Skills 已同步到业务 Preset，也未验证可选 responder 配置及 P5 外部集成。

## 2026-09-11 完整 PRD 回归运行

用户要求基于昨天 PRD 再跑一轮。核对实际 Case 输入后使用《广告画布迭代第二期》revision 802 的六题任务，而非更早的内容审核八题任务。

- [本轮 Run #2](https://agent.sandaii.cn/evolve/tasks/work_4c180535a88aaa5363fd77d8cffb44a1?businessId=b020d1a5-f7c1-400b-8ade-f6132ebd5138&run=run_79d7b8b4837a69d561e788e9b12f5904)：6 Case × 1，实时调用 QA Case Agent，deepseek-v4-pro 判卷；3m43s，completed，4 pass / 1 fail / 1 error。
- EvidenceSet：artifact_3623de5489bceb5d0a68f4302aed3b73；Scorecard：artifact_e36634504cdc783dbe54db9f4290688e；Diagnosis：artifact_49964448cfe5906be13012d4069fc306。通过 UI 和 dev 只读数据库交叉核验。
- qa/mr-annotation 首次 remote_timeout 后第二 Attempt committed 并判通过，实际覆盖重试成功路径，未重现旧 remote_running 转换和 optimistic version conflict。
- qa/full-doc 超过目标 2 分钟上限，取消请求 deadline exceeded，Trial 终态 error/cancel_unconfirmed。随后清理将 Attempt 收敛到 canceled；不能把清理成功解释为该题执行通过。
- qa/faithfulness 回执输出只是一句将按需求生成用例的声明，没有用例，四维均为 0；其余图片、发布套件、次要功能和批注题通过。评分通过线为 3/5。
- 本轮 7 Attempts 的 interaction_count 均为 0，没有执行候选对比或优化搜索，不能从 completed 推断 PR 281 的所有新增能力已端到端验收。

**How to apply:** 优先从上述 Run 的完整 Trial 查看输入、输出、Judge 理由与重试记录；区别执行完成、真实用例产出、判卷通过、远端清理完成四种结果。整体通过比例 4/6，剔除错误项的有效评分通过率 4/5，两个分母不可混用。
