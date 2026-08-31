---
name: vidmuse-zeus
type: system
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, backend, vidmuse-zeus]
links: [vidmuse-aion, vidmuse-ai-frontend, vidmuse-repo-scan-aion-vidmuse-zeus-vidmuse-ai-2026-07-02]
---

# vidmuse-zeus(产品 REST API + AION relay)

Vidmuse 产品 API 事实源。本地:`~/Downloads/sandai-code/vidmuse-zeus/`。
测试仓:`~/Downloads/sandai-code/zeus_api_test/`(见 [testing](testing.md))。

> 注意:`~/Downloads/sandai-code/zeus/` 不是当前 Vidmuse 业务的事实源;不要用它判断 Vidmuse 线上 API 行为。

## 当前确认事实

- Java / Gradle / Spring Boot API 服务。
- 根 README 标题为 `SandAI Product Rest API`。
- 根 `build.gradle` 使用 Java toolchain 23,Spring Boot 3.3.4,Spotless + palantir-java-format。
- Gradle 模块:`api`,`common`,`config`,`domain`,`infra`,`openapi`。
- `modules/api` 依赖 config/domain/common/infra,包含 Spring Web、Validation、Spring Cloud Gateway MVC、Redis/Redisson、Spring Security core、Actuator、OpenAPI UI、Stripe、SchedulerX、Log4j2、Prometheus registry 等。
- 部署 overlay 有 `zeus-vidmuse-dev`,`zeus-vidmuse-staging`,`zeus-vidmuse-prod`,分别挂载对应 ConfigMap。

## 职责边界

vidmuse-zeus 是用户产品侧 REST API,不是 admin 管理后台。已扫描 controller 覆盖这些能力:

- 用户与认证:`/api/v1/user`,`/api/v1/user/profile`,`/api/v1/user/phone`,`/auth/oauth2/*`。
- 项目:`/api/v1/projects`。
- 线程/Agent:`/api/v1/threads`,`/api/v1/threads/{threadId}/messages`,`/api/v1/agent/events`。
- 任务/生成:`/api/v1/tasks`,`/api/v1/generations`。
- 素材/图片/语音:`/api/v1/assets`,`/api/v1/images`,`/api/v1/voices`。
- 配置:`/api/v1/configs`。
- credits/plan/payment:`/api/v1/credits`,`/api/v1/platform/credits`,`/api/v1/plans`,`/api/v1/auth`,`/payment/sessions`,`/payment/stripe/v2/webhook`。
- 分享/收藏/图库/报告/live/invitation/notification/platform api keys/feedback/orders 等产品辅助能力。
- internal:`/internal/business`,`internal/event`,`/api/internal/lark-bot`。

## `/api/v2/threads` 确认链路

这是 `vidmuse-zeus` 手写 relay controller,不是 Spring Gateway MVC route:

1. `vidmuse.ai` 对 adventurer thread 使用 `/api/v2/threads` 前缀。
2. `vidmuse-zeus` 的 `AgentThreadRelayV2Controller` 暴露 `/api/v2/threads/**`。
3. Controller 通过 `UserApiService` 获取当前用户/admin,进入 `AgentService` 做产品层权限检查。
4. `AgentService` 用 product thread id 查 `agent_thread.aion_thread_id`。
5. `AgentManagerClient` 用 `aion.url` + `aion.project.token` 调 AION manager 的 `/public/api/v2/threads/{aionThreadId}/...`。

已确认的 V2 relay:

- `GET /api/v2/threads/{threadId}/messages` -> AION `/public/api/v2/threads/{aionThreadId}/messages/`
- `POST /api/v2/threads/{threadId}/messages` -> AION `/public/api/v2/threads/{aionThreadId}/messages/`
- `POST /api/v2/threads/{threadId}/messages/stream` -> AION `/public/api/v2/threads/{aionThreadId}/messages/stream`
- `GET /api/v2/threads/{threadId}/messages/live` -> AION `/public/api/v2/threads/{aionThreadId}/live/messages`
- `POST /api/v2/threads/{threadId}/control` -> AION `/public/api/v2/threads/{aionThreadId}/control`
- `GET/PATCH /api/v2/threads/{threadId}/document` -> AION `/public/api/v2/threads/{aionThreadId}/document`
- `POST /api/v2/threads/{threadId}/document/file` -> AION `/public/api/v2/threads/{aionThreadId}/document/file`
- `GET /api/v2/threads/{threadId}/voices` -> AION `/public/api/v2/threads/{aionThreadId}/voices`
- `GET /api/v2/threads/{threadId}/export-timeline` -> AION `/public/api/v2/threads/{aionThreadId}/export-timeline`

## Gateway MVC

`vidmuse-zeus` 同时有 Spring Cloud Gateway MVC,但它用于 `/gateway/*` proxy,不是 `/api/v2/threads`。

配置形态:

- `zeus.gateway.enabled=true`
- `zeus.gateway.routes[*].path`
- `zeus.gateway.routes[*].uri`
- `zeus.gateway.routes[*].strip-prefix`

配置样例里 manager route 是:

- `/gateway/manager/**` -> `http://dev-vidmuse-manager-service:443`
- `strip-prefix=2`,所以 `/gateway/manager/foo` 到下游会变成 `/foo`

换句话说:`/gateway/manager/**` 可以打到 AION `/manager/**`;`/api/v2/threads/**` 走 Java relay 到 AION `/public/api/v2/threads/**`。

## 常用命令

```bash
./gradlew spotlessApply
```

```bash
./gradlew check
```

```bash
./gradlew :modules:api:bootRun --args='--spring.profiles.active=dev -Duser.timezone=UTC'
```

## 注意

- 开发配置按 README 从 `resources/application-dev-template.properties` 复制 `resources/application-dev.properties`;不要提交本地 secret。
- 错误处理约定是 `ErrorCode` + `ZeusServiceException`。
- 需要查线上真实下游地址时,看目标环境 ConfigMap 中的 `aion.url`,`aion.project.token`,`zeus.gateway.routes[*]`;repo 里 overlay 只显示挂载哪个 ConfigMap,不包含实际 secret/config 值。
