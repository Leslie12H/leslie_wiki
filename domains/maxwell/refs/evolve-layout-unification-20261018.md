---
name: evolve-layout-unification-20261018
type: reference
created: 2026-10-18
updated: 2026-10-18
tags: [maxwell, evolve, design, layout, catalog]
links: [evolve-benchmark-scoring-display-20261018, evolve-layout-research-20261016]
---

# EVOLVE 新布局的密度与一致性收敛

**Why:** 用户要求整体干净、简洁、统一，避免说明和操作平铺，同时明确保持五类信息框架。目录负责扫读，完整规则和技术标识适合按需展开；不能通过重命名历史指标或隐藏真实错误来制造整洁。

**How to apply:** 当前源码、浏览器截图、交互检查和后端读取边界见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/playwright/evolve-layout-20261018/layout-audit.md`。沿用已选 B 和 Maxwell tokens；本轮属于已选方向迭代。正式页面和部署状态必须分别核对。

- 共享工作面与控件：`apps/studio/src/products/evolve/v3/workspace.css`；批量栏在用例、评分资产和评测记录中按选择显示。完整能力仍在同一目录和详情内，不迁移主导航。
- 分页：共享 `components/composite/PaginatedTable/PaginatedTable.tsx` 的可选单页隐藏模式，以及 EVOLVE 的 `v3/catalog/CatalogPagination.tsx`。隐藏单页控件时保留游标后续页、空结果页的返回和数量状态。
- 规则阅读：`v3/library/ExternalScoringAssets.tsx` 的摘要到全文；`BenchmarkContentsPanel.tsx` 的整题配置按需展开；冻结指标来自历史定义，不能拿当前服务名称或版本覆盖。
- 窄屏：用例表保留最小阅读宽度，在容器内滚动，避免把长名称压成许多行；详情和编辑抽屉另行观察，不以 document 无溢出代替内容可读。
- 验收只读，未创建运行、提交资产或发布服务。页面访问中出现的后端错误和历史协作内容解析警告保留在验收记录，布局检查不能代表这些链路全部通过。
