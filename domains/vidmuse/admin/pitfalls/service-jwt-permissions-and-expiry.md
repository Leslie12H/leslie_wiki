---
name: admin-service-jwt-permissions-and-expiry
type: pitfall
created: 2026-09-10
updated: 2026-09-10
tags: [admin, auth, service-token, account-pool]
links: [vidmuse-admin]
---

# Admin 服务 JWT 必须按部署中的权限契约签发

**Why:** 本地旧签发脚本的无到期 is_admin JWT 即使验签通过，也不能证明生产 API 接受。2026-09-10 在生产发现本地与部署鉴权代码不同，首次真实接口验证返回 401；按部署字段与权限签发后账号池只读请求返回 JSON 200，无凭证请求返回 401。

**How to apply:** 先核对部署中的下列代码指针，再签发和测试。不要把签名校验、公网 HTTP 200、权限通过、业务操作成功合并成一个结论。公网 WAF 可能返回 HTML 200，应检查 Content-Type；必要时在同一生产容器内验证只读 API。创建、领用和删除等操作需单独验证业务流程，不能以只读请求替代。

- `apps/admin/service/jwt_service.py::verify_token`：检查 JWT 原始 claim 到 TokenData 的映射，尤其原始 `type` 与解析后 `token_type` 的区别。
- `apps/admin/service/auth.py::RequireTokenPermission`：检查服务身份、到期时间和显式权限要求，不假定 `is_admin` 可替代服务权限；人工会话走另一授权路径。
- `apps/admin/controller/admin/account_pool.py`：核对完整路由前缀与每个方法的权限。
- `apps/admin/common/permissions.py`：核对权限实际覆盖范围。账号池所用注册权限也可能覆盖白名单/IP 风控，签发前说明真实范围并取得授权。
- `apps/admin/service/account_pool.py`：检查服务身份用于创建与领用审计的字段。

仅保存代码和验收方法指针；不保存 JWT、签名密钥、kubeconfig 或具体凭证内容。部署逻辑会变化，下次必须重新核对。
