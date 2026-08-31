# Vidmuse 业务全景

> Vidmuse 是一个完整的业务系统,由多个子系统组成。本地代码统一在 `~/Downloads/sandai-code/` 工作区下。

## 一句话心智模型

Vidmuse 的用户侧链路可以先按三层理解:

- `vidmuse.ai` 是面向用户的 Web 前端,负责页面、聊天/线程 UI、配置读取和 API client。
- `vidmuse-zeus` 是 Vidmuse 产品 REST API,覆盖账号、项目、线程、任务/生成、支付、credits、配置、素材等用户产品能力,并负责把部分 adventurer/V2 能力 relay 到 AION。
- `aion` 是 agent/runtime/media generation 平台,包含 manager、runner、VidFlow 工作流和 VidMCP 工具服务。

> 修正记录:分析 Vidmuse 产品 API 时使用 `~/Downloads/sandai-code/vidmuse-zeus/`,不要使用 `~/Downloads/sandai-code/zeus/` 作为事实源。

## 子系统清单

| 子系统 | 角色 | 本地路径(sandai-code/) | Page |
|---|---|---|---|
| aion | agent/runtime/media generation 后端平台 | `aion/` | [systems/aion](systems/aion.md) |
| vidmuse-zeus | Vidmuse 产品 REST API + AION relay | `vidmuse-zeus/` | [systems/zeus](systems/zeus.md) |
| vidmuse.ai | 面向用户的 Web 前端 | `vidmuse.ai/` | [systems/vidmuse-ai](systems/vidmuse-ai.md) |
| admin | 管理后台 | `vidmuse-admin/`(+ 多个 release 工作树) | [systems/admin](systems/admin.md) |
| 测试 | 测试仓库群 | `Vidmuse/` `zeus_api_test/` `web_uiautomation/` 等 | [systems/testing](systems/testing.md) |

> 修正记录:后端事实源是 **aion / vidmuse-zeus**;`Vidmuse`(大写)是**测试仓库**,不是前端。

## 分区说明

- **踩过的坑** → [pitfalls/](pitfalls/)
- **进行中的项目/状态** → [projects/](projects/)
- **指针(代码位置/飞书/PRD)** → [refs/](refs/)

## 当前高价值知识页

- [2026-07-02 三仓库代码扫描](refs/2026-07-02-repo-scan-aion-vidmuse-zeus-vidmuse-ai.md) — aion / vidmuse-zeus / vidmuse.ai 的角色、入口和 `/api/v2/threads` relay 链路。
- [admin 深入知识](admin/README.md) — Test Center V2、VidMCP、harness、admin 专属坑。

> 注意:Test Center V2 / VidMCP direct tool call / admin harness 属于 **admin 子系统知识**,不代表整个 Vidmuse 业务域。跨 aion / vidmuse-zeus / vidmuse.ai / admin 的项目才放本层 `projects/`。

## TODO(待补全)

- [x] aion / vidmuse-zeus / vidmuse.ai 的基础技术栈、启动方式、主要入口(2026-07-02 已从代码扫描回填)
- [x] `/api/v2/threads` 代码链路:vidmuse.ai -> vidmuse-zeus relay -> AION `/public/api/v2/threads`
- [ ] 各环境(dev/staging/prod)的 ConfigMap 实际值和 service DNS
