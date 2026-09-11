---
name: vidmuse-executor-candidates
type: project
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, vidmuse, a2a, git, candidates]
links: [vidmuse-executor-p1, vidmuse-a2a-executor]
---

# VidMuse Git 候选准备入口

独立本地仓库 `~/Downloads/sandai-code/vidmuse-executor`，候选准备入口为 cmd/vidmuse-candidate；范围、复现和验收以 docs/candidate-preparation.md、docs/runtime-version-spike.md、docs/acceptance.md 为准。交付与评审入口为 [vidmuse-executor PR #1](https://github.com/world-sim-dev/vidmuse-executor/pull/1)；分支、合并和部署状态需实时核验。

**Why:** 基准文件清单不能复用每轮候选的 inline 预算。真实 Music Video Plugin 的文本数量超过 32；只有候选准备成功也不能证明 AION 加载过该版本。

**How to apply:** 基准用全部可编辑文件元数据计算资源哈希，按需读取内容；每轮从冻结 base 文件树生成完整候选，提交 parent 保留历史以支持正常快进发布。操作与保护边界见独立仓库文档；不要把本地 Git fixture 的 commit 当成其 GitHub 内容来源 commit。

2026-09-11 核验仍需区分当前部署版 A2A 评测、Git 候选准备、候选真实执行三层。Zeus/AION 普通创建链路的版本承载与实读证明尚需路线选择和范围授权；对应源码指针保存在 runtime-version-spike.md，不在此复制接口定义。


## 独立 Plugin 名称部署路径 — 2026-09-11

**Why:** 按同一 plugin_id 选择任意 commit，与新增不可变 plugin_id 后部署，是两种不同的版本承载方式。不要因为普通 API 没有 revision 参数，就排除通过现有 Plugin 选择能力做候选评测，也不要先把 Zeus/AION 扩展当成必需条件。

**How to apply:** 先核对 Zeus AgentService.buildThreadOptions / normalizeExplicitPlugin / createThread 的 options.plugin_id 透传，以及账号固定 Plugin 覆盖；再核对 AION service/agent_thread.py 和 thread_template.py 的目录校验、模板限制和实际 thread.options。独立候选复制完整 Plugin 到新名称，只调整允许资源，保留原目录与 DEFAULT。

部署必须再读 vidmuse-plugins 的 .github/workflows/deploy.yml：2026-09-11 核验版本 277c1c699d8da69a4529799bf6d5416a5b3efc4f；关注环境共用目录中的 checkout / reset / pull，而不是把 workflow_dispatch 理解成追加一个 Plugin。多个候选并存需部署包含所有保留候选的树；分支隔离本身不能保证部署隔离。批次内冻结共享依赖，并通过现有运行证据核对绑定的 Plugin 与文件内容。Runner 重建与共享依赖解析继续查 Workflow Catalog、Thread 与 Plugin 指针页。

以上是源码核验和方案修正，未部署或实测线上账号。方案 B 的逐线程 commit 扩展可在要求同名多版本、跨发布重建仍固定版本时再评估；不能把源码支持写成已完成真实候选闭环。
