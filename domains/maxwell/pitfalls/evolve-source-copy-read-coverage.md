---
name: evolve-source-copy-read-coverage
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, evolve, source-material, evidence, diagnosis]
links: [evolve-route-review-granularity]
---

# 来源复制成功不代表调优模型可读完整正文

**Why:** 来源复制上限、整包读取上限和窗口入口支持的资产类型可能不同。用户已通过原权限引用一份较大的脱敏会话时，引用元数据可以成功送达，但模型读正文被整包上限拒绝，窗口入口又可能拒绝资料类型。此时模型索要附件是实际能力缺口的表现，不能归为已读证据却漏分析，也不能让用户反复重交同一资料。

**How to apply:** 核对固定复制件的资产身份、hash和大小，对照实际模型工具调用及拒绝回执；分别证明复制、元数据、正文覆盖。复用已有窗口读取时只扩展授权资料的只读查询分支，保持原件hash与Work权限，不把资料纳入候选可编辑资源或A2A执行资源。检查当前会话是否真的支持附件，不能凭通用聊天产品经验承诺上传恢复。涉及契约/类型准入变化遵循项目现有批准规则。

## 当前证据指针

2026-11-04 C15路线作家来源的真实复现、批准方案和修复状态沿项目记录核对，不以本页代替最新实施结论：
- `output/evolve-unified-20261019/source-material-window-contract-20261104.md`
- `output/evolve-unified-20261019/flexibility-acceptance-20261022.md`
- 集成目录 `.tmp/c15-autonomous-repair-20261104/source-read-blocker-proof.json` 与两次原始Run事件。
