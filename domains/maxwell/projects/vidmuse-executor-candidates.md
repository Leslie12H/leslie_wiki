---
name: vidmuse-executor-candidates
type: project
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, vidmuse, a2a, git, candidates]
links: [vidmuse-executor-p1, vidmuse-a2a-executor]
---

# VidMuse Git 候选准备入口

独立本地仓库 `~/Downloads/sandai-code/vidmuse-executor`，候选准备入口为 cmd/vidmuse-candidate；范围、复现和验收以 docs/candidate-preparation.md、docs/runtime-version-spike.md、docs/acceptance.md 为准。远端私有仓库 https://github.com/world-sim-dev/vidmuse-executor 已创建；代码上传和实际状态需实时核验，本次推送因缺少具体上传授权被自动审批拒绝。

**Why:** 基准文件清单不能复用每轮候选的 inline 预算。真实 Music Video Plugin 的文本数量超过 32；只有候选准备成功也不能证明 AION 加载过该版本。

**How to apply:** 基准用全部可编辑文件元数据计算资源哈希，按需读取内容；每轮从冻结 base 文件树生成完整候选，提交 parent 保留历史以支持正常快进发布。操作与保护边界见独立仓库文档；不要把本地 Git fixture 的 commit 当成其 GitHub 内容来源 commit。

2026-09-11 核验仍需区分当前部署版 A2A 评测、Git 候选准备、候选真实执行三层。Zeus/AION 普通创建链路的版本承载与实读证明尚需路线选择和范围授权；对应源码指针保存在 runtime-version-spike.md，不在此复制接口定义。
