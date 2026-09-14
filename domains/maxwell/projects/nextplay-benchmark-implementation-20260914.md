---
name: nextplay-benchmark-implementation-20260914
type: project
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, evolve, nextplay, benchmark, a2a]
links: [nextplay-benchmark-final-plan-20260914]
---

# NextPlay 基准接入实施指针

实施代码及最新验收状态见 [nextplay-eval PR 1](https://github.com/world-sim-dev/nextplay-eval/pull/1) 与 [maxwell-ai PR 291](https://github.com/world-sim-dev/maxwell-ai/pull/291)。2026-09-14 是执行基础能力的草稿 PR，不能视为六阶段完成、已部署或已完成真实目标评测。配套实施清单位于 Maxwell docs/nextplay-benchmark-integration-20260914.md 与 nextplay-eval nextplay-a2a/EVOLVE-INTEGRATION.md；版本和剩余事项从 PR 重新核验。

**Why:** 外层 A2A 完成不等于内层目标成功；结果读取必须绑定调用、目标快照、输入和真实文件。模型目录 ready 也不等于真实生成成功：本次有界续答发现 gpt-5.6-sol 不接受强制 temperature=0，改为沿用基准配置后成功。公共 hardGatesMustPass 策略本身不代表 Case 配置了确定性检查，必须展开实际 evaluation 检查。

**How to apply:** 用户已确认续答复用现有 Maxwell 模型通道。使用 runtime/model-completions 和业务凭据，不新增供应商端点/Key，不启动 Agent/工具；先 validateOnly，再做有界实际生成校验。modelId/显式温度来自基准快照，未指定温度时保留通道默认；记录续答策略、实现及实际模型回执。该模型测试不能冒充 baseline/candidate 业务闭环验收。先部署兼容读取侧，再上传匹配包，最后按冻结资产及预算做真实样本。
