---
name: sisyphus-scheduled-admin-jwt-expiry
type: pitfall
created: 2026-09-29
updated: 2026-09-29
tags: [sisyphus, vidmuse, schedule, account-pool, auth]
links: [sisyphus, admin-service-jwt-permissions-and-expiry]
---

# 定时用例的 Admin 会话凭据过期

**Why:** 2026-09-29，Sisyphus `RUN-20260929-0030` 的 `prod / event-tracking` 在 `new_user_join` 用例的 setup 阶段调用生产 Admin 账号池创建接口，收到 JSON `401`。当次 Runner Secret 中的 `ONLINE_ADMIN_JWT` 是 `admin_session`，其 `exp` 为 2026-09-29 06:24:41 UTC；此前 06:15 UTC 的计划运行通过，07:15 UTC 起的同套件计划运行连续失败。用例没有走到埋点断言，不能把它记作埋点功能失败。只核对了 JWT 类型和到期时间，未记录原文。

**How to apply:** 排查同类 setup 401 时，从 Run 的实际 Pod 确认注入变量和 Secret 名，只解析 JWT 的非敏感 claim 与到期时间；再对照 Run 时间、Admin 路由所需权限和部署中的鉴权代码。Sisyphus 的项目环境配置会在每次派发时由 `backend/app/modules/runtime_config/job_config.py` 映射成 Runner 变量；此案需检查项目 `prod` 环境的 `ADMIN_JWT`，而不是修改测试断言或历史 Run Secret。更换为符合生产权限契约的专用服务凭据后，对原 Run 创建新 Attempt 并核对账号池操作、用例断言及清理结果。权限代码以当次部署为准，参考 [Admin 服务 JWT 权限与有效期](../../vidmuse/admin/pitfalls/service-jwt-permissions-and-expiry.md)。

**2026-09-29 验证：** 当次生产 Admin 路由要求 `registration.account_pool.manage`；仅给 Sisyphus 项目 1 的 `prod` 环境 `ADMIN_JWT` 换成带该权限的 `admin_service` 凭据。`RUN-20260929-0030` 的 Attempt 2 在相同 commit 上通过 2/2 用例，`new_user_join` 的账号创建、领用与登录流程均已越过原来的 401。原 Attempt 1 保留失败记录。当前凭据内容及是否仍有效，应到环境配置和生产鉴权处重新核对。

**探测陷阱：** 生产 `POST /admin/api/v1/account-pool/accounts` 的空 JSON 会创建随机账号，不能用它作为“无副作用的鉴权探针”。当次探测误建的唯一待领用账号已按创建者与时间限定删除并读回确认。下次应先看请求模型和业务实现，再选确实无副作用的探测方式。
