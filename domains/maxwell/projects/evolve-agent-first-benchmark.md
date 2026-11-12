---
name: evolve-agent-first-benchmark
type: project
created: 2026-11-12
updated: 2026-11-12
tags: [maxwell, evolve, benchmark, navigation, workflow]
links: [evolve-benchmark-unified-plan-review, evolve-user-manual-entrypoints, evolve-workspace-implementation-20261015]
---

# EVOLVE 对话优先与 Benchmark 信息架构

**Why**

2026-11-12 用户提出以 Dot 和 GPT 式对话作为 EVOLVE 主入口，Benchmark 等内容按需展开。随后指出，Case 和 Judge 是用户在定义评测时才需要理解的组成，评测运行和调优是围绕 Benchmark 发生的动作。把这些概念并列放在首页会增加首次使用的理解成本。

**How to apply**

对话默认占主视图，左侧可新建和回看历史。用户在聊天里描述要分析、验证或改进的问题。单会话诊断可以直接开始。需要反复测量或对比时，Agent 再推荐现有 Benchmark 或准备新 Benchmark 草稿。聊天中的结果和 Benchmark 引用按点击打开详情，关闭后回原会话。需要直接查找时由独立的 Benchmarks 入口进入目录。

## 产品层级

- Benchmark 是用户完成正式评测时主要理解的对象。它描述什么算做得好，以及如何反复验证。
- 「怎么测」呈现评测目标、用例和评分标准。Case、Judge、具体指标、评分服务和可复用资产在配置或核对时展开。共享资产的实际复用范围与所有权沿现有领域定义。
- 「测得怎样」呈现评测历史、失败用例、基线与候选对比。评测和调优由用户在对话提出，也可以由当前 Benchmark 发起。执行前可查本轮目标版本、冻结的评测口径与用例范围。候选对比沿实际冻结记录核对可比性。
- 用户可以先分析已授权的会话，再确定是否需要正式评测。任务关联可随流程建立，内部标识和技术分层由已有实现管理。

## 实施与查证入口

- 先核对 `apps/studio/src/products/evolve/v3/routes.ts` 和 `EvolveWorkspaceV3.tsx`，再看 `EvolveAgentConversation.tsx` 的会话、事实更新和交互回执。Benchmark 和结果详情沿 `v3/library/BenchmarkDetailPage.tsx` 和 `v3/catalog/RecordsPage.tsx` 回查。
- 界面改造可以从入口、会话保留、详情按需挂载开始。核对已有深链接、业务隔离、只读权限、任务绑定后的会话连续性以及已接纳运行的冻结版本。真实能力与边界以当前接口和发布状态为准。
- 2026-11-12 交付为独立交互预览，使用示例对话与评测数据。业务实现与真实运行验收尚未执行。预览会话指针为 Codex `01a1ce76-1824-77a2-8b00-503614d17f09`。
