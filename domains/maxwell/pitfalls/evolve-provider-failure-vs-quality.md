---
name: evolve-provider-failure-vs-quality
type: pitfall
created: 2026-10-30
updated: 2026-10-30
tags: [maxwell, evolve, quality, accounting, model-service]
links: [evolve-runtime-payload-and-terminal-recovery, evolve-candidate-version-and-edit-proof]
---

# 模型服务失败与质量、封存证据分开判断

**Why:** 2026-10-30 原十题独立双轮执行遇到模型服务 HTTP 403。外层包装器和内层被测模型都出现认证类错误，但其中一题已在外层后续失败前完成正式证据封存和原 Judge 评分。只看最外层失败会丢掉有效结果；把未完成题补零又会制造虚假的质量退步。错误分类本身不能证明是密钥过期、账户额度或其它供应商原因。

**How to apply:** 以原 Trial/Attempt 身份串起外层、内层、正式 response、证据包和 Judge 结果，按实际时间保留已封存事实。通过两个 Worker 的精确 Run/Event/Execution 日志定位 HTTP 状态，不使用其它业务错误样本替代。已知账单逐原生用量与持久化事件核验，部分账目保留不完整、无正式包保留未知。原评测终态不覆盖、不盲重派，不通过换模型、加长超时或绕过鉴权处理 403；需要模型服务侧恢复与只读日志证据。源码审查、CI 和部署成功都不能代替有效全量质量样本。

## 证据入口

Maxwell 根工作区 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的 2026-10-30 23:28 记录，以及集成工作区 `.tmp/c13-exact-provider-failures-20261030.json`、`c13-exact-outer-provider-failures-20261030.json`、`c13-accounting-proof-20261030.json` 与 `c13-joint-quality-acceptance-20261030.json`。服务状态、样本数量和当前分数沿这些原件核实，不在本页固化。
