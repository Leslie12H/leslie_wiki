---
name: sandai-api-platform-performance-testing-entrypoints
type: reference
created: 2026-10-27
updated: 2026-10-27
tags: [sandai, api-platform, performance, testing, quota]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-openapi-quota-entrypoints]
---

# API 平台压测方案入口

**Why:** 2026-10-27 用户要求制定 API 平台压测方案和提前准备清单。生成接口受理、长时任务执行、轮询请求和计费存在不同瓶颈，单看 HTTP 202 或虚拟用户数无法给出业务容量。

## 去哪里看

- 可评审方案：`/Users/leslie/Documents/ChatGPT/Apipltform/docs/performance-test-plan.md`；工作区根 README 有导航。负载阶梯、建议 SLO、预算、准备项、分工及执行状态都以该文档和后续正式报告为准，本文不保存变化中的数值。
- 创建 RPM：Zeus `modules/domain/.../platform/quota/GenerationRateLimiter.java` 与 v2 `OpenApiGenerationService.java`；查询限流查 `GenerationController.java` 和 `RateLimitHelper.java`，不得把创建配额直接用于轮询。
- 派发与占位：Zeus `docs/openapi-task-dispatch.md` 和 `modules/domain/.../task/dispatch/`；外部 processing 状态与真实下游执行数要分别取证。
- 费用：`OpenApiTaskEnqueueService.java` 的扣费/入队事务、当前计费契约及测试组织流水。fake 是否计费、异步失败费用及退款能力执行前重新核对。
- 既有测试原件：工作区 `postman/reports/` 的配额、联调和参数专项；历史配置与缺陷不可当作当前部署结果。

**How to apply:** 先确认预测峰值、环境、有效配额、预算与观测，再分开验证配额正确性、fake 平台容量、真实模型吞吐和故障恢复。用到达速率与任务耗时估算执行并发，用在途任务量与轮询间隔估算查询量；创建与追踪分开编排，保留未知任务和费用证据。方案中的门槛为评审建议，只有执行报告才能证明容量。停止新增请求后仍需追到既有任务终态或明确未决状态，再对账与恢复配置。
