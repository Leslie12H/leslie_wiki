---
name: sisyphus-scheduled-admin-jwt-expiry
type: pitfall
created: 2026-09-29
updated: 2026-11-25
tags: [sisyphus, vidmuse, schedule, account-pool, auth]
links: [sisyphus, admin-service-jwt-permissions-and-expiry]
---

# 定时用例的 Admin 会话凭据过期

**Why:** 2026-09-29，Sisyphus `RUN-20260929-0030` 的 `prod / event-tracking` 在 `new_user_join` 用例的 setup 阶段调用生产 Admin 账号池创建接口，收到 JSON `401`。当次 Runner Secret 中的 `ONLINE_ADMIN_JWT` 是 `admin_session`，其 `exp` 为 2026-09-29 06:24:41 UTC；此前 06:15 UTC 的计划运行通过，07:15 UTC 起的同套件计划运行连续失败。用例没有走到埋点断言，不能把它记作埋点功能失败。只核对了 JWT 类型和到期时间，未记录原文。

**How to apply:** 排查同类 setup 401 时，从 Run 的实际 Pod 确认注入变量和 Secret 名，只解析 JWT 的非敏感 claim 与到期时间；再对照 Run 时间、Admin 路由所需权限和部署中的鉴权代码。Sisyphus 的项目环境配置会在每次派发时由 `backend/app/modules/runtime_config/job_config.py` 映射成 Runner 变量；此案需检查项目 `prod` 环境的 `ADMIN_JWT`，而不是修改测试断言或历史 Run Secret。更换为符合生产权限契约的专用服务凭据后，对原 Run 创建新 Attempt 并核对账号池操作、用例断言及清理结果。权限代码以当次部署为准，参考 [Admin 服务 JWT 权限与有效期](../../vidmuse/admin/pitfalls/service-jwt-permissions-and-expiry.md)。

**2026-09-29 验证：** 当次生产 Admin 路由要求 `registration.account_pool.manage`；仅给 Sisyphus 项目 1 的 `prod` 环境 `ADMIN_JWT` 换成带该权限的 `admin_service` 凭据。`RUN-20260929-0030` 的 Attempt 2 在相同 commit 上通过 2/2 用例，`new_user_join` 的账号创建、领用与登录流程均已越过原来的 401。原 Attempt 1 保留失败记录。当前凭据内容及是否仍有效，应到环境配置和生产鉴权处重新核对。

**探测陷阱：** 生产 `POST /admin/api/v1/account-pool/accounts` 的空 JSON 会创建随机账号，不能用它作为“无副作用的鉴权探针”。当次探测误建的唯一待领用账号已按创建者与时间限定删除并读回确认。下次应先看请求模型和业务实现，再选确实无副作用的探测方式。

## 2026-11-25 按自动化入口提供后台凭据

**Why:** 传统 Runner 的 Admin REST 和 AI UI 的号池 MCP 使用不同的凭据。传统项目环境变量即使在派发阶段被装进 Run Secret，Sisyphus 主线的环境保存及读取入口仍处理原值。2026-09-29 的生产修复记录用于说明当时的变量映射及故障恢复，不能作为生产凭据的长期存放指引。

**How to apply:**

- REST 调用从 Admin 的 `RequireTokenPermission` 和目标路由回查服务 JWT 类型、有效期与显式路由权限。由目标环境的 Admin 维护方签发独立、有到期时间且可轮换的机器凭据，走受控部署 Secret。Sisyphus 侧沿 [Runner 变量组装](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/modules/runtime_config/job_config.py)、[Job Secret 投影](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/integrations/kubernetes/job_manifest_env.py) 和 [ACK 发布流程](https://github.com/world-sim-dev/sisyphus/blob/main/deploy/README.md) 确认脚本所需的键会在选定环境被投影。只写入 Secret 键不保证 Job 会引用它。避开普通测试环境变量的值字段，其写入和回读边界见 [环境保存](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/modules/execution_resources/environments.py) 与 [环境响应](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/api/resources/presenters.py)。
- AI UI 号池调用沿 [Admin 号池 MCP 部署说明](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/mcp_servers/README.account-pool.md) 与 [Sisyphus Midscene MCP 接入说明](https://github.com/world-sim-dev/sisyphus/blob/main/docs/operations/midscene-mcp.md) 配目标环境的专用 Bearer、已绑定的号池测试主体和工具白名单。连接测试只覆盖工具发现。变更后以新 Run 验证实际业务动作与清理。

2026-11-25 通过两个仓库的 GitHub 主线核对上述入口。现场部署版本、Secret 是否已配置及现有 Runner 是否引用相应键仍需按目标环境回查。

## 2026-11-25 AI UI 创建与执行的鉴权

**Why:** 创建 AI UI 用例或 Run 属于 Sisyphus 控制面，运行中的号池动作才调用 VidMuse Admin。Sisyphus 的号池操作手册曾写为 Runner 拦截新注册模式，而主线桥接实现已将模式和业务准入交给上游 Admin。

**How to apply:** 创建接口的项目访问与 Agent scope 沿 [AI UI 路由](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/api/routes_ai_ui.py) 和 [鉴权依赖](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/api/auth_dependencies.py) 回查。号池配置绑定项目环境，运行时开关沿 [AI UI 运行选项](https://github.com/world-sim-dev/sisyphus/blob/main/frontend/src/domains/ai-ui/ui/AiUiRunOptions.tsx) 回查，Bearer 走 MCP 私有运行时输入。需要验证新账号流程时，沿 [MCP 运行契约](https://github.com/world-sim-dev/sisyphus/blob/main/docs/architecture/mcp-midscene.md)、[新注册传输回归](https://github.com/world-sim-dev/sisyphus/blob/main/runner/tests/mcp_new_registration.test.mjs) 和目标环境冻结的 Runner 版本核对。Runner 转发模式与目标环境实际完成注册、登录和释放分别验收。

## 2026-11-25 长期凭据的有效期核对

**Why:** REST 服务 JWT、号池 MCP Bearer 与 Sisyphus Agent Token 的过期和失效机制各自实现。号池 MCP 对照部署里的单个 Bearer 值，替换时需要核对同环境的其他消费者；长期有效并不等于具备独立签发期限。

**How to apply:** 先确认入口、目标环境与权限范围。REST JWT 的 `exp` 取 [Admin 签发器](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/service/jwt_service.py) 与 [权限校验](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/service/auth.py) 的契约。号池 MCP 的凭据比较沿 [MCP 鉴权](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/service/account_pool_mcp_auth.py)，部署 Secret 名及现有消费者另查目标环境。Sisyphus Agent Token 的配置上限沿 [有效期配置](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/core/config.py) 与 [CLI 签发入口](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/api/routes_auth.py) 回查。本次仅核对代码契约，未创建或更新凭据。

### 2026-11-25 发版后的 REST JWT 有效性

**Why:** REST JWT 由 Admin 验签，Pod 换代与凭据轮换是不同事件。海外 Dev 和 Staging 当天签发的服务 JWT 使用 HS256，两套 Deployment 均引用已有环境配置。

**How to apply:** 先从 JWT 头核对算法，再核对运行中 Deployment 的配置引用和 [Admin 发版步骤](https://github.com/world-sim-dev/vidmuse-admin/blob/main/.github/workflows/admin-deploy.yml) 是否保留原验签配置。常规镜像发版沿用相同验签密钥和权限契约时，旧 JWT 可继续用到期。发版后若出现 401，核对实际部署的验签配置及缺失、到期或替换情况。用号池列表 GET 验证，记录状态与响应结构。2026-11-25 仅检查部署引用和主线发布流程，未执行实际发版。

### 2026-11-25 GitHub Secret 保存与 Runner 生效

**Why:** GitHub production 环境保存凭据、发布同步到 Kubernetes、Runner Job 投影以及实际 Admin 验证是不同环节。一项新 GitHub Secret 存在时，当前 Workflow 和 Job 仍可能没有引用。现有 Job 的同名变量也可能仍来自普通项目环境变量。

**How to apply:** 先比较 [发布部署](https://github.com/world-sim-dev/sisyphus/blob/main/.github/workflows/release.yml)、[既有镜像部署](https://github.com/world-sim-dev/sisyphus/blob/main/.github/workflows/deploy-existing.yml)、[Secret 同步脚本](https://github.com/world-sim-dev/sisyphus/blob/main/scripts/release/deploy.sh) 和 [Job 投影](https://github.com/world-sim-dev/sisyphus/blob/main/backend/app/integrations/kubernetes/job_manifest_env.py)。对现有 Run，只检查变量的 Secret 引用，必要时只解析类型、到期等非敏感 JWT 元数据。新增接线按项目与目标环境投影，并核对历史变量的优先级。保存回执只能证明 GitHub 持久化，须以新 Run 的引用与只读 Admin 请求确认生效。
