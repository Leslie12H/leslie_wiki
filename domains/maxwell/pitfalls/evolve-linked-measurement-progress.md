---
name: evolve-linked-measurement-progress
type: pitfall
created: 2026-10-27
updated: 2026-10-27
tags: [maxwell, evolve, progress, authorization, review]
links: [evolve-catalog-projection-and-external-adoption, evolve-candidate-loop-decision-boundaries]
---

# 关联测量目录、自动进度与实际写入归属

**Why:** 目录扩展为候选独立验证和重评后继后，仅修改列表与详情不足以完成闭环。2026-10-27 的原页面显示旧进度，手动刷新后才与数据库一致；审查发现 SSE 的优化聚合仍只查询直属 Work，遗漏子 Work 变化。相邻取消按钮也仍携带当前展示 Work，而后端正确要求 Run 的实际所属 Work，因此会拒绝合法取消。

**How to apply:** 按同一 Run 检查列表、事件流、统计、详情、原件及写操作，而不是假设所有调用方共享语义。目录和 SSE 应复用同一持久化关联与原件权限过滤，保持分页/扫描边界；只读关联不转移所有权。取消等操作发送实际 Work 和版本，继续由原接口独立鉴权，随后刷新父视图。合成测试覆盖子记录独立变更、隐藏范围、撤权与取消请求路径；性能测试单独记录，不能称线上端到端通过。不要取消正在验收的业务任务来证明按钮技术修复。

## 查证入口

- Maxwell：`services/evolve-server/internal/modules/evolve/infrastructure/postgres/catalog.go` 的共享关联 CTE、`work_run_progress.go` 的有界聚合，及 `candidate_assessment_integration_test.go`。
- Studio：`apps/studio/src/products/evolve/EvolveWorkspaceStore.ts` 和同名测试；请求复用生成客户端。
- 当前修复、运行期加载和真实验收分别查 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/flexibility-acceptance-20261022.md`。本页不记录可变部署状态，不将合成测试或手动刷新当自动更新实测通过。
