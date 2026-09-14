---
name: evolve-judge-authorization-decoupling
type: project
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, evolve, judge, authorization]
links: [evolve-preset-evaluation-entry]
---

# EVOLVE 判卷授权与执行器登记解耦

2026-09-14 基于 main `56dca229e598196c0db09cbf5340b8313ec79eb4` 开始修复，分支 `codex/evolve-judge-auth`，隔离目录 `/private/tmp/maxwell-judge-auth-20260914`。复核入口为该目录 `docs/evolve-judge-authorization-fix.md`（变更范围、权限边界、技术验证与发布后步骤）；初始交付为本地修复，后续合并与发布核验见下节。

**Why:** 外部 A2A 的 Token 与评测业务调用评分模型的凭据用途不同。凭据初始化若只挂在 Maxwell Preset 登记，会使合法的 A2A 执行链路无法判卷；登记额外的 Maxwell Agent 不能作为产品修复方案。

**How to apply:** 从 `commands/model_settings.go` 的 PrepareJudgeModel、HTTP model-settings/prepare、Studio ModelSettingsStore 追踪配置动作；通过既有 app 注入的托管 Key 签发和模型校验能力完成准备。模型接口使用 runtime_run；不因判卷而增加 Preset runtime_read，原生目标登记仍保留自身检查。验证失败须保留已加密保存的一次性密钥，Run/Worker 不负责签发。具体代码和测试随分支变化，复用前按上述报告与当前源码重新核对。


## 2026-09-14 PR 与 DEV 发布核验

- [PR #288](https://github.com/world-sim-dev/maxwell-ai/pull/288) 已合并，提交 `42422737a513dc8b6c898a17c0af42ec5d7d843d`。合并前跟进主干 #270；相对主干的最终修复仍为 18 个判卷相关文件。旧文件读取 HEAD 测试夹具冲突采用主干已有修复，没有夹带文件服务运行改动。
- [合并前 CI](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34803971166)：Studio、EVOLVE、CI report 通过，其他服务由主干新增的变更检测判为跳过。
- [DEV 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34804133566) 固定上述合并提交；仅发布 Studio 与 EVOLVE API/Worker，不做数据库迁移。日志核验北京时间 11:57:04–11:57:05 API/Worker 均 successfully rolled out，部署工作流的镜像一致性与运行时检查通过。
- [Studio 构建 196](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34804140421) 使用同一提交。公开 agent.sandaii.cn 的页面引用 `/build/maxwell/studio/196/assets/index-mAKao3SS.js`；原 Nextplay 工作区刷新后展示“验证判卷模型”，原 gpt-5.6-sol 模型和 Nextplay 外部执行目标保留。
- 本次核验到发布与入口展示，没有点击准备授权或创建真实 Run；不能将发布通过写成 Nextplay 初评/候选调优闭环完成。后续从工作区验证判卷模型并确认运行计划，再核对真实执行、判卷和候选回执。

**Why:** 构建成功、部署成功、入口更新和真实业务闭环分别证明不同环节。固定合并提交避免并发主干更新改变本次发布范围。

**How to apply:** 从 PR、CI、发布和 Studio 子构建链接读取当前状态；版本、凭据与 Run 都会变化，复验以现场为准。模型配置核验在启动对话框高级设置中执行，不需要额外登记 Maxwell Agent。

## 2026-09-14 首轮 Trial 的后续交互阻断

现场追溯指针：Work `work_35c276d93336f8552b6a5e55f6a19488`，Run `run_2e649a2a517c6dbb351ce1057a736f39`，Trial `trial_70c5f82e2a9852e138febfa8e73f4d54`，远端任务 `run-0221e9a9c8479ccd29999b21d2b6c19a`。查看 Studio Trial 详情及远端运行追踪；不要将执行中断写成质量不通过或凭据错误复发。具体远端问题尚未取得。

**Why:** 部署版本的 `evaluation/live_interaction.go` 会在远端要求交互而 Case 缺少或无法解析 `input.interaction` 时终止；A2A turns 路径也可能返回同一错误分类。因此仅凭 `remote_interaction_required` 不能断言具体问题或唯一分支。Studio `workbenchResults.ts` 的 `trialScoreState` 仅凭 verdict 存在就显示已判卷，会把执行错误结果误标为已判卷。

**How to apply:** 核对冻结 Case 原文、Attempt 错误详情和远端问题后，再选择有边界的 scripted 或 agent-context responder；后者还需核对 Worker responder 配置。普通提示词中的少追问要求不等于协议交互配置。检查 `execution/interaction.go`、`evaluation/live_interaction.go` 和 `app/integration/a2a/registry.go` 当前实现；历史交互方案页可能落后于实现。未到 Judge 阶段的 Run 不能证明真实判卷已通过。
