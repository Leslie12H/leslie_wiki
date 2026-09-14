---
name: nextplay-real-run-contract-review-20260914
type: pitfall
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, evolve, nextplay, runner, a2a, judge]
links: []
---

# Nextplay 真实评测契约复核

**Why:** 单元测试、A2A Card 健康和外层 Agent 完成都不能证明内层目标执行、文件回收和判卷成功。2026-09-14 的真实验收逐层暴露冻结资产缺执行声明、回执配置未持久化、文件根目录不一致、判卷输入上限和计划卡片封装不兼容。

**How to apply:** 从失败 Trial 的原始请求核对 execution，而非把旧冻结资产问题归因于 A2A 丢字段。分开记录外层包装业务、内层目标业务/Preset、prepared snapshot、冻结 Case inputDigest；候选仅在同一快照上完整替换。UI 保存后必须刷新回读；实际目标完成后还须检查五文件内容、执行身份/快照/输入哈希、清理回执、Judge assessment 和候选比较。

## 代码与验证指针

- [Maxwell PR 292](https://github.com/world-sim-dev/maxwell-ai/pull/292)：显式 Runner baseline 绑定、候选同快照约束、Case 前置校验与 resultDelivery 编辑入口。绑定入口不等于远端 prepare-baseline 已运行。
- [Nextplay PR 2](https://github.com/world-sim-dev/nextplay-eval/pull/2)：Case execution.projectRoot 固定正式五文件路径；缺文件时保留临时资源，避免错误清理导致证据不可追回。使用仓库正式构建脚本，上传后导出逐文件比对；runtime.env 仅按用户明确授权原样保留于同一 Skill。
- [Maxwell PR 293](https://github.com/world-sim-dev/maxwell-ai/pull/293)：公共站点 PATCH 返回空 HTML 400，配置实际未保存。新增同处理器 POST configuration，经生成客户端使用，保留旧 PATCH。main 部署后已在 UI 保存并刷新回读 resultDelivery。
- [Maxwell PR 294](https://github.com/world-sim-dev/maxwell-ai/pull/294)：真实 Runtime 成功回执包裹 MCP structuredContent，裸 JSON 解析导致计划确认卡消失；手动入口增加可配置温度。更新状态及部署证据从 PR/Actions 核验。
- Judge 源码入口：services/evolve-server/internal/modules/evolve/methods/judge。完整轨迹可能超过 256 KiB 判卷输入限制，按真实评测对象选择 JSON Pointer /finalState；完整轨迹仍保留审计。文件与执行身份的真实性由 Runner receipt 验证，不能要求 Judge 从缺少的轨迹猜测事实。
- gpt-5.6-sol 实际 model-completions 在 temperature=0 被 Provider 拒绝，temperature=1 且正确 JSON 系统要求与足够输出预算时成功。模型目录预检不证明实际生成健康。

## 验收边界

2026-09-14 的本地 Runner 首次目标执行已完成文字创作，但五文件回收路径错误而失败；不能算 EVOLVE 初评通过。新的资产、回执配置与修复包已准备，真实 EVOLVE baseline/candidate 的最终结果须从对应 Work 最新 Run、Trial、assessment 和 comparison 回读，不能从部署状态推断。

PR 294 的 [main Studio 部署 34833091753](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34833091753) 成功后，界面已显示并锁定原计划 temperature=1。2026-09-14 18:28 通过精确计划卡片启动 [真实基准 Run](https://agent.sandaii.cn/evolve/tasks/work_35c276d93336f8552b6a5e55f6a19488?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_abad357944edf3f8bf97ae9abb2acec5)，确认外层 Python Runner 与内层隔离 Thread 实际运行；最终通过与候选比较仍以该 Work 回执为准。

真实首轮进一步暴露外层高频 status 轮询：外层 Trace 报 `execution budget exhausted after 26 model calls (remaining: 0)`，EVOLVE 随后报 `invalid_evidence: runtime result is unavailable; remote cancel failed: remote_failed: server error`。目标五文件和 trial-evidence 于外层失败后才保全，故不能据目标最终完成抹去该 Run 的链路失败。[nextplay-eval PR 3](https://github.com/world-sim-dev/nextplay-eval/pull/3) 将等待移入 `status --wait-seconds 240`，外层 exec 使用 270 秒超时；45 tests + 4 subtests 通过。合并 main 正式打包上传、Skill 导出五文件和原 runtime.env 字节比对通过，Prompt 刷新回读通过；新的真实运行仍需逐项验收。
