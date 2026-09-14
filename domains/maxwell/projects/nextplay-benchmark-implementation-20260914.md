---
name: nextplay-benchmark-implementation-20260914
type: project
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, evolve, nextplay, benchmark, a2a]
links: [nextplay-benchmark-final-plan-20260914]
---

# NextPlay 基准接入实施指针

实施代码及最新验收状态见 [nextplay-eval PR 1](https://github.com/world-sim-dev/nextplay-eval/pull/1) 与 [maxwell-ai PR 291](https://github.com/world-sim-dev/maxwell-ai/pull/291)。2026-09-14 两个 PR 已合并，部署证据见下方；本次交付不能视为六阶段完成或已完成真实目标评测。配套实施清单位于 Maxwell docs/nextplay-benchmark-integration-20260914.md 与 nextplay-eval nextplay-a2a/EVOLVE-INTEGRATION.md；版本和剩余事项从 PR 重新核验。

**Why:** 外层 A2A 完成不等于内层目标成功；结果读取必须绑定调用、目标快照、输入和真实文件。模型目录 ready 也不等于真实生成成功：本次有界续答发现 gpt-5.6-sol 不接受强制 temperature=0，改为沿用基准配置后成功。公共 hardGatesMustPass 策略本身不代表 Case 配置了确定性检查，必须展开实际 evaluation 检查。

**How to apply:** 用户已确认续答复用现有 Maxwell 模型通道。使用 runtime/model-completions 和业务凭据，不新增供应商端点/Key，不启动 Agent/工具；先 validateOnly，再做有界实际生成校验。modelId/显式温度来自基准快照，未指定温度时保留通道默认；记录续答策略、实现及实际模型回执。该模型测试不能冒充 baseline/candidate 业务闭环验收。先部署兼容读取侧，再上传匹配包，最后按冻结资产及预算做真实样本。

## 2026-09-14 发布与资源更新

用户要求从合并后的 main 发起部署；使用固定合并提交的发布分支仍不符合该发布要求。最终发布以 [main 部署任务 34824272805](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34824272805) 为准，headBranch=main，headSha=50c4ff997132cababfd14b1ef5ab509abfffe850。任务成功，EVOLVE API/Worker rollout 与 Runtime 验证通过；公开站点回读为 Studio 200。后续版本应重新从工作流和站点核验。

[外层 A2A Preset](https://agent.sandaii.cn/agents/697f4aa1-0a2f-4ce6-a54f-5c8c70453b71?businessId=d913480b-bbf3-4c3f-956b-cab3a6854dee) 的原 Skill 已覆盖更新，Prompt 加入 v2 协议。重新导出比对 SKILL.md、assets/runtime.zip、scripts/run.py、runtime.env.example 与正式构建产物一致；用户明确授权 runtime.env 原样放回同一站点/业务/Skill，回读确认字节未变。Prompt 重新进入页面回读一致。保留原 Preset 引用；未自动修改既有 Executor 的 opt-in 配置、冻结资产或重跑历史 Run。
