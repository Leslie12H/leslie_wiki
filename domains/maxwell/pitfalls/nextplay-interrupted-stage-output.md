---
name: nextplay-interrupted-stage-output
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, nextplay, sdk, evidence, interruption]
links: [evolve-usage-accounting]
---

# 后阶段中断不能借用前阶段交付

2026-11-04 的生产采集回归确认：首阶段完整结束后，后阶段已受理但未产生文本即中断，全局输出投影仍可能保留首阶段回答，导致本次 finalText/last-message 与 trial_evidence 错配。保留完整历史事件不等于最终交付归属正确。

**Why:** 逐事件投影只有新内容到来才替换旧内容；未完成阶段恰好没有内容时，旧值不会自然失效。仅测首阶段中断或已有后阶段文本会漏掉这个分支。

**How to apply:** 中断结果只由该阶段实际观察重建，之前完成的 Turn 与原事件留在历史。有真实当阶段文本仍保留，不能一律抹掉。测试覆盖完整前阶段加空后阶段、完整前阶段加实际后阶段文本，并经过生产 transport 的异常观察附着与最终证据序列化；绕过 transport 的桩不能代表真实契约。

实现指针：Maxwell 工作区 `.tmp/nextplay-runtime-flexibility/maxwell-runtime/src/nextplay_runtime/runner.py`、`results.py`，对应 `tests/test_final_agent_text.py` 与 `tests/test_standalone.py`。当前安装与验证证据以 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 2026-11-04 12:10 记录及 integration `.tmp/c14-later-stage-sdk-20261104/installation-proof.json` 为准。

下载包导入测试证明已发布文件包含修复，不替代新的 A2A 执行与业务质量；原失败、账单、归档均不得回写。
