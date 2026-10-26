---
name: antd-loading-accessible-name-race
type: pitfall
created: 2026-10-20
updated: 2026-10-26
tags: [testing, react, antd, accessibility, async]
links: [sandeval-e2e-acceptance]
---

# Ant Design 加载图标退场与按钮名称断言竞态

**Why:** 异步业务提示已更新，不等于组件内部加载动画已退出。2026-10-20 的 Sand Eval 批量验收回归中，版本冲突提示已出现，按钮仍短暂包含 loading 图标，其无障碍名称变成 loading 加按钮文字；即时精确名称查询因此失败。应先看失败 DOM 与状态变化，不能把这类现象直接判成业务行为错误。

**How to apply:** 用 waitFor 或 findByRole 等待要验证的最终按钮名称和状态，保留禁用、版本与请求身份断言；不加固定休眠，也不放宽业务断言。先对比 main 是否改动了目标产品文件，再单独回归失败文件，最后等待最终提交的完整 Gate。一次本地通过不能替代 CI。

核验指针（会变，使用前重查）：
- [PR #2671](https://github.com/world-sim-dev/sandai-data-smith/pull/2671)：测试提交 c3399b9ce；业务文件 BulkAcceptanceModal.tsx 未因该竞态修改。
- 测试：sand-eval/platform/frontend/src/pages/quality/management/BulkAcceptanceModal.test.tsx 的版本冲突场景。
- 原始 Gate：[39404027094](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39404027094)，失败 DOM 名称与定向 21 项回归日志保存在 /Users/leslie/Documents/Playground/output/shot-end-time-display-20261020/。


## 2026-10-26 批量验收重试与发布检查

**Why:** 部分成功计数和失败提示可以早于整个批量请求结束出现；按钮加载图标退场也有独立时序。只在版本冲突断言等待最终状态，还会遗漏普通超时重试和整改验收准备未完成的同类交互。PR 通过后，main 的重新执行仍可能暴露该竞态，部署会按闸口正确跳过。

**How to apply:** 重试交互等待按钮的最终精确名称与可操作状态，继续验证重用原 request_id、跳过成功项和版本冲突不换版。不为测试稳定而改业务组件或加固定休眠。修复提交须走新的干净 main PR 和完整 Gate；仅测试变更合并后若发布面未触发，使用现有 main workflow_dispatch 重新运行受闸口保护的完整发布流程。完成后独立读取生产 deploy_sha、镜像及依赖健康状态，不能以已合并或 Gate 绿代替上线证明。

失败 DOM、具名回归、修复与最终发布证据沿 [PR #2847](https://github.com/world-sim-dev/sandai-data-smith/pull/2847) 和[发布恢复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/release-recovery-status.md)回查；原失败为 [main run 40285732430](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/40285732430)。
