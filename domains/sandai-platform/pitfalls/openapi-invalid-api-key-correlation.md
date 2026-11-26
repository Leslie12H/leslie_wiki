---
name: sandai-openapi-invalid-api-key-correlation
type: pitfall
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, openapi, authentication, sls]
links: [sandai-api-platform-development-entrypoints]
---

# 开放平台 API Key 401 的入口与请求查证

**Why:** OpenAPI 在成功识别 Key 后才把组织 ID 加入请求上下文。Key 鉴权失败时，按组织 ID 搜索会漏掉这类 401。控制台在线体验的会话鉴权可独立成功。应用日志中的路由和区域只能用于挑选候选，客户端实际请求的域名需要入口访问日志或客户端证据确认。

**How to apply:** 从客户端取失败时间、请求方法、URL 和响应头中的 `X-Request-Id` 或 Trace ID。以 [组织任务量看板](../refs/openapi-organization-task-volume.md) 的双区 Zeus SLS 数据源为入口，按请求 ID 与时间查鉴权阶段和路由。有采样的 401 应结合可读的网关访问日志核对。只有错误文案时，保留同窗口候选和关联缺口。

- 在 Zeus 的 `ApiKeyAuthFilter`、`OpenApiKeyService`、`ApiKeyMapper` 核对 Bearer 格式、部署环境和启用状态。组织与 Key 状态可在 [Zeus Admin](https://zeus-admin.sandaii.cn/organizations) 用脱敏元数据核对。
- 在 `ApiErrors`、`ArkErrors` 和 `docs/openapi-v2-generations.md` 核对对外错误映射。OpenAPI v2 与 Ark 兼容路由的错误响应格式不同。模型授权单独按业务错误码核对。
- 在 `TraceIdFilter` 和 `RequestOutcome` 核对关联字段和鉴权日志采样是否有变更。
