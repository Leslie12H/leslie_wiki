---
name: sandeval-cross-workbench-question-order
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, remediation, testing]
links: [sandeval-direct-remediation-and-batch-handoff]
---

# 同一标注批次跨工作台不能靠题号定位整改题

**Why:** 2026-09-28 测试环境直接整改中，同一批的 0:09 和 0:10 视频在标注端与 Sand 质检队列的显示次序不同。测试者按“第 1 题”跨界面定位，首次改了 0:09；Sand 下一轮看到真正退回的 0:10 仍是第 1 版。按素材重新定位并将 0:10 改为第 2 版后，Sand 复验才看到新答案。本次是测试定位误差；仅凭这次观察不能认定系统把答案交错。

**How to apply:** 跨标注、供应商质检与 Sand 质检核对整改时，以题目 ID、素材标识或视频本身作为关联键，记录答案版本和各轮质检报告；界面“第 N 题”只用于当前工作台导航。检查新答案时同时核对原问题对应素材、版本历史及 Sand 新轮次，避免把改错题误判为自动回交失败。具体样本和导出指针见 [Sand 直达整改核验入口](../refs/sandeval-direct-remediation-and-batch-handoff.md)。
