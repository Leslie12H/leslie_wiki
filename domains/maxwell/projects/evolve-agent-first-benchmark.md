---
name: evolve-agent-first-benchmark
type: project
created: 2026-11-12
updated: 2026-11-13
tags: [maxwell, evolve, benchmark, navigation, workflow]
links: [evolve-benchmark-unified-plan-review, evolve-user-manual-entrypoints, evolve-workspace-implementation-20261015]
---

# EVOLVE 对话优先与 Benchmark 信息架构

**Why**

2026-11-12 用户提出以 Dot 和 GPT 式对话作为 EVOLVE 主入口，Benchmark 等内容按需展开。随后指出，Case 和 Judge 是用户在定义评测时才需要理解的组成，评测运行和调优是围绕 Benchmark 发生的动作。把这些概念并列放在首页会增加首次使用的理解成本。

**How to apply**

当前方案随用户对 Duet 的偏好收敛为持续主对话，历史通过搜索、时间线和具体工作回看。用户在聊天里描述要分析、验证或改进的问题。单会话诊断可以直接开始。需要反复测量或对比时，Agent 再推荐现有 Benchmark 或准备新 Benchmark 草稿。聊天中的结果和 Benchmark 引用按点击打开详情，关闭后回原会话。需要直接查找时由独立的 Benchmarks 入口进入目录。下方早期预览保留为历史交付指针。

## 产品层级

- Benchmark 是用户完成正式评测时主要理解的对象。它描述什么算做得好，以及如何反复验证。
- 「怎么测」呈现评测目标、用例和评分标准。Case、Judge、具体指标、评分服务和可复用资产在配置或核对时展开。共享资产的实际复用范围与所有权沿现有领域定义。
- 「测得怎样」呈现评测历史、失败用例、基线与候选对比。评测和调优由用户在对话提出，也可以由当前 Benchmark 发起。执行前可查本轮目标版本、冻结的评测口径与用例范围。候选对比沿实际冻结记录核对可比性。
- 用户可以先分析已授权的会话，再确定是否需要正式评测。任务关联可随流程建立，内部标识和技术分层由已有实现管理。

## 实施与查证入口

- 先核对 `apps/studio/src/products/evolve/v3/routes.ts` 和 `EvolveWorkspaceV3.tsx`，再看 `EvolveAgentConversation.tsx` 的会话、事实更新和交互回执。Benchmark 和结果详情沿 `v3/library/BenchmarkDetailPage.tsx` 和 `v3/catalog/RecordsPage.tsx` 回查。
- 界面改造可以从入口、会话保留、详情按需挂载开始。核对已有深链接、业务隔离、只读权限、任务绑定后的会话连续性以及已接纳运行的冻结版本。真实能力与边界以当前接口和发布状态为准。
- 2026-11-12 交付为独立交互预览，使用示例对话与评测数据。业务实现与真实运行验收尚未执行。预览会话指针为 Codex `01a1ce76-1824-77a2-8b00-503614d17f09`。

## 2026-11-12 参考 Dot 与 Claude Duet 的使用方案

用户明确要求先出方案，并指定参考 OpenAI Dot 与 Claude Duet。本轮以官方文档及公开演示为依据，账号内的完整任务链路仍待真实体验。

**Why**

长时间评测需要让用户随时继续交代事情，同时找得到进度、需要处理的事项和已完成产物。前版以新对话和历史为中心的预览，对持续工作与主动回报表达不足。

**How to apply**

以下为待评审的产品建议。默认进入当前用户在所选业务内的持续对话，复杂主题可以单独展开。用户从目标开始，Agent 组织工作并在已授权范围内推进。用「进行中」和「待你处理」承接持续状态，用 Benchmark 保存可复用的测量标准。一次工作可包含多次运行并引用多套 Benchmark，具体运行必须标明采用的评测版本与被测版本。关系设计应沿当前领域模型评估，不能由导航压缩直接推断数据库归属。

右侧按需打开具体结果、Benchmark 定义、计划或证据。用户阅读或手工修改产物时，对话中的引用应定位到同一对象及版本。主对话优先呈现结论、重要变化和待决策事项，执行明细可展开。运行结束后的用户交付需包含结果与证据，遇到无法继续的情况应呈现实际阻碍和已完成部分。

参考入口会持续变化，后续应回源核对。

- [Dot 持续协作、后台工作与对话](https://learn.chatgpt.com/docs/dots) 与 [Activity、控制和停止范围](https://learn.chatgpt.com/docs/dots/controls)。
- [Duet 主对话、Channels、Tasks 与 Make](https://support.claude.com/en/articles/17631495-get-started-with-claude-duet) 与 [官网演示](https://claude.com/product/claude-duet)。

## 2026-11-12 Duet 方向与 Session 分层方案

用户进一步表达更倾向 Duet，并要求完整方案及中间 Session 的处理方式；尚未授权业务实施。

**Why:** 持续主对话需要可追溯的工作过程，用户也需要深入讨论某项工作。若将执行重试、阶段切换和用户讨论都作为同级聊天，会重新增加管理负担。官方对 Duet 的历史与 Channels 说明回查上方使用文档，不从公开界面推断内部 Session 架构。

**How to apply:** 建议主入口收敛为对话、工作、Benchmarks。取消常驻历史聊天侧栏，保留消息搜索、主对话时间线、已结束工作及原有深链接。简单问答不强制创建工作；持续目标由 Agent 自动建立。主对话与工作会话面向用户，执行 Session 由系统管理，一件工作可跨多次执行接续，具体映射沿现有模型核对。

输入默认面向主 Agent，选择“讨论这项工作”后明确显示当前范围；单纯打开报告不隐式改变范围。工作过程按需展开，结论与待决定事项回主对话。持续上下文依赖工作状态、可检索历史及来源引用，不能仅靠摘要判断运行事实。Benchmark 可跨工作复用，评测证据保持版本可回查。

完整方案及验收条目：[EVOLVE 持续协作使用方案](/Users/leslie/.codex/visualizations/2026/11/12/01a1ce76-1824-77a2-8b00-503614d17f09/evolve-duet-product-proposal.md)。包含导航、输入范围、工作与执行生命周期、历史、版本、恢复、迁移和首版边界；状态为待评审，未实现、未执行真实验收。

## 2026-11-13 Duet 方向交互 Demo

**Why:** 用户要求查看参考 Duet 的 Demo，需要直观看到持续主对话、工作会话和右侧产物之间的关系。

**How to apply:** 在该 Codex 会话的可视化目录交付独立 Demo `evolve-duet-demo.html`。先点对比报告，再展开工作过程、选择讨论这项工作；也可模拟修复验证、暂停与继续，检查报告回主对话的体验。导航保留对话、工作、Benchmarks，历史从搜索和工作回看。仅采用示例数据与预设回复，没有接入业务服务或修改业务代码。

验证范围和截图回查同目录 `duet-demo/verification.md`：主对话与工作草稿隔离、按需详情、模拟执行回报、标准修订与冻结引用、历史搜索及桌面/窄屏布局已做浏览器检查。该验证不能作为真实 Agent 能力或线上业务验收。
