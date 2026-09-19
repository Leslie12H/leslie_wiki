---
name: sandeval-returnable-impersonation
type: reference
created: 2026-09-19
updated: 2026-09-19
tags: [sand-eval, authentication, impersonation, security]
links: []
---

# Sand Eval 可返回代登录入口

**Why:** 2026-09-19 用户确认调整切号语义：内部人员需要连续复现不同账号的问题，同时避免外部账号独立登录继承返回内部身份的能力。返回和退出并发时，仅删除代登录记录、签发无关联内部 JWT 会留下撤销缺口。

**How to apply:** 当前业务边界从 `sandai-data-smith/sand-eval/knowledge/DECISIONS.md` 的代登录条目进入；完整契约在 `docs/superpowers/specs/2026-08-06-space-permission-model-design.md`。工程取舍见 `.agents/notes/implemented/feature/2026-09-19-returnable-impersonation.md`。源码入口为 `platform/backend/app/services/facts/impersonation.py`、`platform/backend/app/api/auth.py`、`platform/backend/app/dependencies.py`；界面入口为 `platform/frontend/src/components/ImpersonationBar.tsx`。

验收时查看 `platform/backend/tests/test_impersonation.py` 与 Redis CAS 回归，重点区分同一目标账号的独立登录和内部人员发起的会话。首次切号、返回后再次切号，都必须覆盖退出先完成与后完成两种顺序；另检查审计故障时能否撤销、返回本人后的额外数据库查询数。空间停用验证应沿 `platform/backend/tests/test_space_scope.py` 核对真实仓储查询语义，不能只依赖行为不同的测试替身。广播刷新不能替代服务端旧页面写入检查；认证准入审计也不能证明业务事务提交成功。

本次实现位于本地分支 `codex/returnable-impersonation`、修复提交 `e620152a2`（2026-09-19）。隔离账号的浏览器/HTTP 验收与临时真实 Redis 并发验证只证明本地交互及撤销边界；PR Gate、真实 Feishu OAuth、生产部署状态须另行核实。
