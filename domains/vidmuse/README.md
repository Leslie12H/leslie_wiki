# Vidmuse 业务全景

> Vidmuse 是一个完整的业务系统,由多个子系统组成。本地代码统一在 `~/Downloads/sandai-code/` 工作区下。

## 子系统清单

| 子系统 | 角色 | 本地路径(sandai-code/) | Page |
|---|---|---|---|
| aion | 后端服务 | `aion/` | [systems/aion](systems/aion.md) |
| zeus | 后端服务 | `zeus/` `vidmuse-zeus/` | [systems/zeus](systems/zeus.md) |
| vidmuse.ai | 前端 | `vidmuse.ai/` | [systems/vidmuse-ai](systems/vidmuse-ai.md) |
| admin | 管理后台 | `vidmuse-admin/`(+ 多个 release 工作树) | [systems/admin](systems/admin.md) |
| 测试 | 测试仓库群 | `Vidmuse/` `zeus_api_test/` `web_uiautomation/` 等 | [systems/testing](systems/testing.md) |

> 修正记录:后端只有 **aion / zeus**(无 muse);`Vidmuse`(大写)是**测试仓库**,不是前端。

## 分区说明

- **踩过的坑** → [pitfalls/](pitfalls/)
- **进行中的项目/状态** → [projects/](projects/)
- **指针(代码位置/飞书/PRD)** → [refs/](refs/)

## TODO(待补全)

- [ ] 各子系统的技术栈、启动方式、对外接口(下次涉及时现场确认后回填)
- [ ] 子系统之间的调用关系图
- [ ] 各环境(dev/staging/online)的部署与配置差异
