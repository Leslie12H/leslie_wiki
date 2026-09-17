---
name: yunxiao-release-branch-research
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [yunxiao, flow, release, git]
links: [team-test-main-cherry-pick-workflow]
---

# 云效多需求分支生成 release 调研入口

**Why:** 2026-09-17，用户询问能否用阿里云产品聚合多个需求分支并自动创建 release。调研按云效理解，未配置云效账号或修改发布流程。

**How to apply:** 先区分选择发布范围、Git 自动合并、质量准入三件事。按以下官方入口复核当前能力，再用两个独立需求分支验证新增、移除、冲突和 SHA 绑定。产品套餐与权限以当前控制台为准。

## 官方指针

- [Flow 分支模式](https://help.aliyun.com/zh/yunxiao/user-guide/branch-mode)：查看 Git 分支管理器、基础分支、运行分支集合、退出集成后的重新生成规则及冲突处理。
- [流水线源](https://help.aliyun.com/zh/yunxiao/user-guide/configure-pipeline-source)：查看 GitHub 接入、服务连接与 Monorepo 完整历史要求。代码源可读不代表已验证自动创建分支的写权限。
- [代码源触发](https://help.aliyun.com/zh/yunxiao/user-guide/code-source-trigger)：核对不同代码托管平台的事件支持；勿把 Codeup 的 MR 事件能力直接套到 GitHub。
- [变更持续交付](https://help.aliyun.com/zh/yunxiao/user-guide/change-the-continuous-delivery-model/)：核对 AppStack 变更选择、环境准入、审核卡点及当前套餐限制。
- [单应用最佳实践](https://help.aliyun.com/zh/yunxiao/user-guide/best-practices-for-continuous-delivery-of-single-application-changes)：查看多变更集成和退出发布的示例。

## 与现有流程的边界

已确定流程见 [Test/Main Cherry-pick 团队规范](team-test-main-cherry-pick-workflow.md)。Flow 的动态 release 集成方案应作为备选评估；不能因调研自动替换长期 test 分支及 cherry-pick 上线规则。若先做试点，建议限定为生成测试候选，继续使用现有 CI 的测试、构建与部署证据。

待实测：GitHub 仓库分支写入与保护规则、精确提交冻结、分支更新触发后的集成集合、与 GitHub Actions 的回执衔接；尚无云效端到端运行证据。
