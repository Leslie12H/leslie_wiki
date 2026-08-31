---
name: vidmuse-ai-frontend
type: system
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, frontend]
links: [vidmuse-admin, vidmuse-zeus, vidmuse-aion, vidmuse-repo-scan-aion-vidmuse-zeus-vidmuse-ai-2026-07-02]
---

# vidmuse.ai(前端)

Vidmuse 面向用户的前端。本地:`~/Downloads/sandai-code/vidmuse.ai/`。

> 注意区分:`~/Downloads/sandai-code/Vidmuse/`(大写)是**测试仓库**,不是前端,见 [testing](testing.md)。

## 当前确认事实

- pnpm workspace,Web 客户端位于 `apps/vidmuse`。
- `apps/vidmuse/package.json` 显示主要栈:Next `16.1.6`,React `19.2.0`,TypeScript,`next-intl`,MobX,Ant Design,Tailwind,SWR,Axios,Slate,media-chrome,wavesurfer 等。
- 源码分层来自 README:
  - `src/app`: Next routes。
  - `src/api`: generated API client。
  - `src/component`: 可复用 UI。
  - `src/store`: MobX store。
  - `src/view`: 页面/功能编排。

## 后端调用入口

- `src/api/index.ts` 创建 generated Main API 和 AssetMeta API client。
- server-side base URL 使用 `API_SERVER_URL`;browser-side base URL 使用 `/`。
- dev/PREVIEW 下 `next.config.ts` 将 `/api`,`/auth`,`/payment`,`/gateway` rewrite 到 `DEV_SERVER_PROXY_TARGET`。
- response interceptor 对多数 401 跳转 `/login`;profile/config 相关请求有降级处理。
- `src/service/thread/threadRepository.ts` 有两套 thread backend profile:
  - default:`/api/v1/threads`
  - adventurer:`/api/v2/threads`
  `getThreadRepository(threadType)` 按 `getThreadRuntimeProfile` 选择。
- `/api/v1/threads` 和 `/api/v2/threads` 都先进入 `vidmuse-zeus`;其中 `/api/v2/threads` 再由 `AgentThreadRelayV2Controller` relay 到 AION `/public/api/v2/threads`。
- `src/service/config.ts` 通过 `/api/v1/configs` 读取 `tool_status_config_v1`,`pricing_page_config_v1`,`banner_config_v1`,`global_config_v1`,`model_list_config_v1`,并通过 Redis config 检查 `vidmuse2_user_white_list`。

## 页面/功能入口

已扫描到的主要 routes:

- localized 用户页:`/`,`/login`,`/thread`,`/thread/[id]`,`/pricing`,`/mv`,`/templates`,`/skill`,`/cli`,`/feedback`,`/share/[id]` 等。
- route handlers:`/api/healthz`,`/static/[...path]`,`/abff/download`,`/abff/experiments/me`,`/abff/questionnaire/country-regions`。
- `src/view` 中的高价值目录:Home,Login,Pricing,ChatUI,ThreadList,ThreadDetail,ThreadContentView,ThreadShare,Feedback,Questionnaire,Maintenance。

## 常用命令

```bash
pnpm install
```

```bash
pnpm --filter vidmuse dev
```

```bash
pnpm --filter vidmuse test
pnpm --filter vidmuse lint
pnpm --filter vidmuse typecheck
pnpm --filter vidmuse build
```

```bash
pnpm --filter vidmuse idl
pnpm --filter vidmuse idl:asset-meta
```

## 注意

- 这是用户侧前端,不是 `Vidmuse/` 大写测试仓,也不是 `vidmuse-admin/` 管理后台。
- API client 是生成代码;改接口类型前要确认 IDL/generation 流程。
- Next production build 当前启用 Turbopack alpha;如果 dev 正常但 production 构建异常,README 建议优先排查 Turbopack 差异。
