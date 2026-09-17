---
name: sandeval-local-startup
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [sandai-data-smith, sandeval, local, pnpm]
links: [sandeval-sql-lock-diagnosis]
---

# Sand Eval 本机启动入口

**Why:** 2026-09-17 在 macOS 本地启动时，默认 Kubernetes context 属于其他集群，且 pnpm 严格依赖布局暴露了代码直接引用间接依赖 dayjs 的问题。启动前应先确认配置来源和依赖解析，不能把前端 HTTP 200 当作后端可用。

**How to apply:** 从仓库 `sand-eval/knowledge/test-environment.md` 进入本机调试流程；核对 `platform/scripts/prepare_local_debug.py` 的配置资源、身份参数及本地覆盖，账号只落本机被忽略的 `.env`。不要把个人 kubeconfig、凭据或账号配置加入文档。依赖当前声明以 `platform/backend/requirements-prod.txt`、共享 `sand-common-infra/packages/feishu-kit` 和 `platform/frontend/package.json` 为准。

- 本机使用 Python 3.11 与 pnpm；如 dayjs 仅以间接依赖安装，先核对实际 import 与包声明，本次通过 pnpm 的 `--public-hoist-pattern=dayjs` 安装选项恢复本地解析，没有修改业务代码。
- 集群访问方法见 `~/.codex/skills/sdh-infra-access/SKILL.md`，使用操作者自己的授权配置，不沿用其他项目默认 context。
- 验收同时检查后端 `/health`、经 Vite 代理的 `/api/auth/me` 和浏览器实际页面。直接 Uvicorn 调试不包含 Nginx 媒体代理，视频播放需要独立验证。
