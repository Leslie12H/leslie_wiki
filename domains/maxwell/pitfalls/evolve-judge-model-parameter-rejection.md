---
name: evolve-judge-model-parameter-rejection
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, judge, model, temperature]
links: [nextplay-evaluation-gates-20260916, evolve-judge-authorization-decoupling]
---

# Judge 参数拒绝被掩盖为暂不可用

2026-09-16 的线上复现与保存证据重判记录见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evaluation-gates-20260916.md` 的“判卷恢复验证”；后续状态从其中的 Run 链接重新读取。当前模型允许参数以实际模型接口为准，不将本次值推广到其他模型。

**Why:** 授权与模型目录预检通过不保证生成参数兼容。模型参数拒绝若返回 500，而调用方丢弃响应正文并按可重试故障处理，用户只能看到 judge_unavailable，无法区别配置错误与暂时服务故障。

**How to apply:**

- 从 Run 快照核对实际 Judge 模型、temperature、输出格式和 token 上限；用同源最小请求取得错误 code、说明与 traceId，注意探针凭据与真实 Judge 凭据是否相同。
- 查 `services/agent-server/internal/modules/runtime/application/model_completion.go` 的 validateOnly 范围与参数校验；查 `services/evolve-server/internal/app/integration/llmjudge/maxwell.go` 的响应解析与重试分类。保留已脱敏的结构化错误，参数拒绝不应盲目重试。
- 参数修正后优先复用已保存证据重判，实际成功后再核验业务默认持久化，避免不必要的目标重跑。
- 旧三维 Judge 重判成功只能证明该评分路径恢复。接入 D1–D5 必须另行验证规则、过程证据和校准；不同 Judge 的结果不能直接做候选提升比较。
