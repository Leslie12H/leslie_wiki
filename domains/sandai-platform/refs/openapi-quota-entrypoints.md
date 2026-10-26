---
name: sandai-api-platform-openapi-quota-entrypoints
type: reference
created: 2026-10-26
updated: 2026-10-26
tags: [sandai, openapi, quota, concurrency, testing]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-global-acceptance-20261026]
---

# OpenAPI 频率、并发与 TPM 实现入口

**Why:** 2026-10-26 用户询问 TPM 和并发限制。必须先区分每分钟请求/任务数与模型 token 吞吐量，核对仓库已有能力，避免重复实现或把本地代码默认值当作线上配置。

## 去哪里看

源码根为 `/Users/leslie/Documents/ChatGPT/Apipltform/zeus/`；重新核对 HEAD 与部署版本后再使用以下入口：

- `docs/openapi-task-dispatch.md`：组织频率与执行并发的既有语义、管理员配置、缓存传播、迁移与消费者发布条件。状态和默认值以当前源码及真实配置为准。
- `modules/domain/.../domain/platform/quota/OrganizationQuotaService.java`、`GenerationRateLimiter.java`：组织覆盖/全局默认、Redis Redisson OVERALL、429 与依赖失败 503。
- `modules/api/.../api/admin/AdminOrganizationQuotaController.java`：组织配额 GET/PUT、超级管理员授权、保存与 Redis 同步回执。
- `modules/domain/.../domain/task/dispatch/TaskConcurrencySlots.java`、`TaskDispatchWorker.java`、`TaskDispatchStateService.java`：Redis Lua 原子占位、按 taskId 去重、满额等待、终态提交后释放、未知受理保留名额及恢复。
- v1 创建入口为 `PlatformGenerationController`，v2 创建经过 `OpenApiGenerationService`。需要核对不同版本的额度检查位置和失败计数口径，不能仅凭类存在认定覆盖一致。

## 设计使用边界

- 当前组织配额字段与每次申请一个 permit 的创建限流不是 token TPM。Tasks Per Minute 可沿创建频率实现；Tokens Per Minute 需要明确 tokenizer、计量范围、上限、预占与实际 usage 结算契约。
- 视频场景可使用每分钟生成秒数或明确的算力单位，但不要把自定义权重标成真实模型 token。计费额度、分钟吞吐额度与并发名额分别处理。
- 并发计算后台任务生命周期，不能在 HTTP 返回时释放。已运行任务不因短 TTL 到期自动失去占位；未知提交先恢复查证。
- 新增分钟预算时，采用 Redis 原子检查/扣减，明确滚动窗口还是允许突发的 token bucket，组织总额优先，避免用户轮换 API Key 绕过。
- 2026-10-26 的本次工作仅只读分析和方案，未修改业务代码、配额或部署；当前线上生效情况需另查。

**How to apply:** 先读取上述调度文档与真实配额回执，确认缺少的是配置启用、对用户展示、执行并发还是 token 计量。补 TPM 时明确预占 ID、重复请求、失败返还与窗口到期的语义，再用隔离环境验证多实例争抢、终态重复回调、未知受理和队列上限。

## 2026-10-26 真实配额测试入口

- 专项报告：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/quota-global-20261026/README.md`。阈值、窗口恢复、token TPM 检查范围、任务采样有效性、费用与待确认项以该报告及相邻 JSON/CLI 原件为准，不把默认配置当组织有效覆盖值。
- 可复查脚本：项目 `postman/scripts/quota_acceptance.py`；probe / observe 为只读查询，concurrency 为会收费的 fake 任务创建。复查旧任务不重发创建请求。
- **Why:** Postman CLI 退出码 0 只证明实际执行的断言通过；异步采样若未真正发出请求，空快照不能证明并发生效。
- **How to apply:** 同时核对实际 HTTP 查询数、逐任务状态记录、样本完整性与断言数。没有队列/在途证据时保留未验证；修复采样先读已有任务，再依据当前授权决定是否增加付费样本。严格执行并发还需组织配额与内部 slot / 下游时间线。
