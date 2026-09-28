---
name: evolve-runtime-judge-review-20260916
type: project
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, nextplay, judge, runtime, review]
links: [nextplay-runner-thread-preset-binding, evolve-received-evidence-before-run-freeze]
---

# Runtime 托管业务 Judge 评审方案

完整方案及待决策项见[飞书评审文档](https://j0yswlgboxz.feishu.cn/docx/MVladfDzpouRvXx3MZucmQzan0d)。2026-09-16 状态为评审草案，不代表协议获批、平台已接通、资源已同步或评测已恢复；当前实现状态应从文档源码锚点、PR 和运行回执重新核验。

**Why:** Nextplay 已有业务 Python 判卷链，但不能把它调用模型的 HTTP 请求当成对外 Judge 服务。通过现有 Runtime 托管业务包可以避免每个业务单独运维服务，同时保留逐题规则、视觉/脚本检查、硬门槛和评分状态。Skill 分发、固定入口执行、完整证据交付、正式评分入库是不同验收。

**How to apply:**

- 按文档第 4、7 节评审逐题评分快照和版本策略：新独立评测可解析最新已发布版本，candidate 继承所属 baseline 比较快照；不能每个 Run 各自解析 latest。新版两侧重判保留历史记录，缺少新增证据时需要重新执行。
- 从第 5、6 节核对文件交付、身份与哈希绑定、源事件正文保全、Runtime 固定入口、依赖环境和幂等恢复；不能只根据 A2A 外层完成声明验收。
- 从第 8、9 节核对旧平台整数/维度完整性限制、部分无法评分、业务子项及硬门槛的真实改造范围；新版本契约不得静默改写旧记录。业务规则与判卷代码属于业务包，平台只提供通用运行和管理能力。
- 第 10 至 12 节提供阶段、验收矩阵和待决策项。用户本次要求创建文档供评审，不能将文档写入解释为部署、合并或真实 Run 的新授权。
