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

## 2026-10-27 飞书方案与观测核查

- 飞书评审文档：[API 平台压测执行方案与观测清单](https://j0yswlgboxz.feishu.cn/docx/Q88sdPyI9oZ43xxuFtnc5QyXnPg)。本地核查指针：工作区 `docs/observability-readiness.md`。大盘链接、权限、环境和数据新鲜度随执行重新验证。
- 指标存在与大盘可用分开：调度/配额 JSON 接口、ARMS overlay、Prometheus 示例分别沿源码回查；不能据此宣称业务指标已被采集或某环境大盘已有数据。
- 核对调度字段语义：`TaskDispatcherRuntime.snapshot()` 的本地组织工作队列/耗时，与业务 WAITING/任务排队分开；`TaskDispatchWorker.maxSelectedWaitingAgeMillis` 为历史最大值，不能替代当前全队列最老等待。
- 费用规则以 `TaskDispatchStateService`、`TaskFailureRefundPolicy`、`TaskCreditRefundService` 和当前部署有效开关/流水核验；旧调度说明中的失败退款描述可能落后于实现。验收覆盖应退、已退、待处理及重复退款。

**Why:** 运维模板、累计快照和旧说明都容易被误作实时业务观测，导致压测通过而积压或补偿问题未被发现。

**How to apply:** 先让运维给出目标环境大盘并用冒烟证明数据变化，再补业务队列/真实执行/费用只读采样；无法访问时明确保留未核实，不能断言不存在。
