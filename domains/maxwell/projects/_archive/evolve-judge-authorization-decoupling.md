---
name: evolve-judge-authorization-decoupling
type: project
created: 2026-09-14
updated: 2026-09-29
status: archived
archived: 2026-09-29
tags: [maxwell, evolve, judge, authorization]
links: [evolve-preset-evaluation-entry]
---

# EVOLVE 判卷授权与执行器登记解耦

> **已归档（2026-09-29）：** PR #288 已于 2026-09-14 合并并发布 DEV；后续 Runner 基准模式与真实评测转入 nextplay-benchmark-implementation-20260914。

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

## 2026-09-14 远端会话确认具体根因

现场证据：[包装 Agent 会话](https://agent.sandaii.cn/chat/thread?businessId=d913480b-bbf3-4c3f-956b-cab3a6854dee&threadId=thr_01M2F3MJ4CBZE61MS4VGAPFJZG&presetId=697f4aa1-0a2f-4ce6-a54f-5c8c70453b71)。12:43:35 收到评测任务，12:43:42 唯一已运行工具为 SKILL_LOAD maxwell-candidate-runner，12:43:55 要求完整 Candidate Skill 包或替换 SP。页面没有运行脚本调用；包装 Agent 尚未进入目标试跑。该现场补足上一节的未知远端问题。

**Why:** 该次已加载 Skill 明确面向 Candidate 试运行，输入要求基准、任务和完整替换内容；EVOLVE 首轮初评接入了这个候选执行器。包装 Agent 把 variant 描述/artifactRef 判为不足，主动提出 CANDIDATE_INPUT 问题，继而在 EVOLVE 形成 remote_interaction_required。A2A 传输已成功，问题发生在包装 Agent 的输入契约，不能以增加自动应答器掩盖 baseline/candidate 模式不匹配。

**How to apply:** 从上方会话展开唯一工具及完整结果复核当时 Skill；基准初评应支持无替换的固定基准运行，候选试跑才要求完整候选内容，并验证 artifact 引用能被执行端解析。需检查包装 Agent Prompt、Skill 与底层 runner 的一致性；本次只诊断，未修改运行配置、提交回答或启动目标。

## 2026-09-14 运行包静态核验

评估报告：`/private/tmp/runner-package-review/assessment.md`，含包哈希及提取源码指针。下载线上导出包后仅提取代码，没有读取 runtime.env 或运行目标。

**Why:** request.py 强制要求候选，runner.py 无条件打包候选，但底层 materialize(snapshot, None) 已有完整基准物化能力。增加基准模式可复用现有隔离与清理。另有每次重新获取当前基准、目标等待输入即停止清理、固定 Nextplay 五文件判据等独立边界。

**How to apply:** 先核对报告包哈希和当前线上版本，再修改请求校验、Runner 分支及 Prompt/Skill，重建 runtime.zip；基准模式不可作为缺失候选的隐式降级。多轮交互和跨轮基准固定必须分别验收。

## 2026-09-14 正式仓库修复落点

Runner 正式源码为 world-sim-dev/nextplay-eval，基于 main fcea6b1，隔离目录 `/private/tmp/nextplay-eval-main-20260914`，本地提交 b849bf1。说明见 maxwell-runtime/README.md，源码在 src/nextplay_runtime，操作包装 Skill/Prompt 在 standalone，构建入口 scripts/build_skill.py。26 项离线测试通过，生成包不含 runtime.env，未上传或真实运行。

Maxwell 基于 main 42422737，隔离分支 codex/evolve-baseline-runner，最终本地提交 884c24b3；复核 docs/evolve-baseline-runner-20260914.md。移除了临时 Runner 副本，保留接入说明、冻结/传递回归和字体样式/评分状态修复。Studio check、两个 Go 定向测试及本地真实组件排版预览通过。

**Why:** 同一执行器可以评测不同任务的 A/B/C Preset，目标不能写死。EVOLVE 已传递 Run 冻结的完整 content，需明确每任务的运行声明，不能误称会自动取最新草稿。Runtime 本已支持无 patch 物化，本次接通显式 baseline 路径并核对候选的预期基准快照。

**How to apply:** 从两个仓库上述源码和说明复验，不在 maxwell-ai 维护 Runner 副本。发布后新建并确认匹配执行器契约的 Manifest；保留部署凭据。现有五文件及输入等待即停止的边界未变，不把离线通过视为真实调优完成。

## 2026-09-14 正式打包与线上资源更新

基于 nextplay-eval main 1182275，修复提交 08cd798（codex/package-runner-latest），正式入口 nextplay-a2a/build.py；此前 standalone 构建为过渡版本。源码与部署核验记录见 nextplay-a2a/README.md。原测试 Skill 和外层 Prompt 已在 Studio 更新，回下载五个部署输入文件逐字节一致，原 runtime.env 保留；平台导出另附版本元数据。运行测试 25 项、构建测试 1 项通过，未启动真实初评。

**Why:** 仅改 Skill 文本会留下旧 Python 候选必填逻辑；仅更新运行包会被外层 Prompt 的候选必填规则拦住。

**How to apply:** 从正式源码打包并同步 Prompt，导入时保持原 slug/ID/绑定及执行配置。既有冻结资产不会自动新增 execution 声明，真实运行前需用新资产明确 mode、目标及候选预期快照。
