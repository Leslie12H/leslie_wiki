---
name: evolve-judge-authorization-decoupling
type: project
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, evolve, judge, authorization]
links: [evolve-preset-evaluation-entry]
---

# EVOLVE 判卷授权与执行器登记解耦

2026-09-14 基于 main `56dca229e598196c0db09cbf5340b8313ec79eb4` 开始修复，分支 `codex/evolve-judge-auth`，隔离目录 `/private/tmp/maxwell-judge-auth-20260914`。复核入口为该目录 `docs/evolve-judge-authorization-fix.md`（变更范围、权限边界、技术验证与发布后步骤）；当前仅本地修复，未合并、部署或真实评测。

**Why:** 外部 A2A 的 Token 与评测业务调用评分模型的凭据用途不同。凭据初始化若只挂在 Maxwell Preset 登记，会使合法的 A2A 执行链路无法判卷；登记额外的 Maxwell Agent 不能作为产品修复方案。

**How to apply:** 从 `commands/model_settings.go` 的 PrepareJudgeModel、HTTP model-settings/prepare、Studio ModelSettingsStore 追踪配置动作；通过既有 app 注入的托管 Key 签发和模型校验能力完成准备。模型接口使用 runtime_run；不因判卷而增加 Preset runtime_read，原生目标登记仍保留自身检查。验证失败须保留已加密保存的一次性密钥，Run/Worker 不负责签发。具体代码和测试随分支变化，复用前按上述报告与当前源码重新核对。
