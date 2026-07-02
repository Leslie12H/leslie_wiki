# leslie_wiki 目录

> 全库入口。每个 session 先读本文件,再按任务相关性 Read 具体 page。
> 维护规矩见 [CLAUDE.md](./CLAUDE.md)。

## Domains(业务系统)

### vidmuse — [业务全景](domains/vidmuse/README.md)
- [aion](domains/vidmuse/systems/aion.md) — 后端服务
- [zeus](domains/vidmuse/systems/zeus.md) — 后端服务
- [vidmuse.ai](domains/vidmuse/systems/vidmuse-ai.md) — 前端
- [admin](domains/vidmuse/systems/admin.md) — 管理后台(多 release 工作树)
- [testing](domains/vidmuse/systems/testing.md) — 测试仓库群
- pitfalls / projects / refs — *(暂空)*

## Disciplines(职业知识)
- [testing](disciplines/testing/README.md) — 测试方法论 *(暂空)*
- [dev](disciplines/dev/README.md) — 开发实践 *(暂空)*

## Global(通用)
- pitfalls / refs — *(暂空)*

---
*开新业务:`cp -r domains/_template domains/<新业务名>` 并在此加一节。*
