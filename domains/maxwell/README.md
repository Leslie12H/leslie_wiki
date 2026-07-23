---
name: maxwell
type: system
created: 2026-07-23
updated: 2026-07-23
tags: [maxwell, agent-platform, eval, optimization]
links: [maxwell-quality-eval]
---

# Maxwell AI — Agent 基础设施与管理平台

仓库:`~/Downloads/sandai-code/maxwell-ai`(Go monorepo)。通用 Agent 基础设施平台,eval/自迭代能力是其中一个产品(内部叫 **Quality** 域)。

## 结构

| 路径 | 职责 |
|---|---|
| `services/agent-server/` | 主后端(Gin/Huma + Postgres),eval 逻辑全在这 |
| `services/file-server/`, `services/mcp-server/` | 文件服务 / 官方内置 MCP 工具 |
| `apps/studio/` | React/MobX Web UI,eval 前端在 `src/products/eval/` |
| `apps/sandi/` | Expo/RN 独立 app(与 eval 无关) |
| `docs/` | 设计文档,eval 权威设计是 `docs/eval-product-architecture.md` |

- 后端严格三层:`internal/foundation`(infra)→ `internal/modules`(业务)→ `internal/app`(组装/DI)。
- Quality 域在 `internal/modules/quality/`(`eval/` + `optimization/` + `target/` + `workflow/`),Maxwell 专属 adapter 在 `internal/app/quality/adapters/maxwell/`。
- 有独立部署入口 `cmd/quality-server/`(只带 Identity + model gateway + Eval + Optimization)。
- 前端类型全部从 OpenAPI 生成,不手写 URL。
- 迁移必须显式 `cmd/agent-server migrate`,禁止隐式改 schema。

## 关键约定

- **Eval 不改 Agent 的版本模型**:Quality 自己持有不可变 revision(`eval_content_revisions`,content_hash 锚定),Agent/Runtime 继续用 live preset。
- 2026-07 时点正在做 eval 独立产品化解耦(branch `codex/eval-migration-cleanup`)。

Quality 域的 eval/自迭代机制详见 [[maxwell-quality-eval]]。

## TODO(现场确认后回填)
- [ ] maxwell 与 vidmuse 业务的关系(是否同一团队/服务于谁)
- [ ] 部署环境、CI 流水线细节
