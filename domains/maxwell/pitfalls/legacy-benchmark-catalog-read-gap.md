---
name: legacy-benchmark-catalog-read-gap
type: pitfall
created: 2026-11-03
updated: 2026-11-03
tags: [maxwell, evolve, benchmark, frozen-artifact, tuning]
links: [evolve-benchmark-unified-plan-review]
---

# 旧 Benchmark 原件存在，不代表有标准资产目录修订

**Why:** 历史 Benchmark 的冻结 CaseSet/Judge 可以早于标准目录、也可以没有 Work 归属。页面若只按 Work 或标准目录反查，会把可读原件误显示为“未找到资产修订”。目录缺失不等于原件不存在，也不应该通过补写历史来掩盖查询路径缺口。

**How to apply:** 先只读核对冻结引用、原件内容哈希、业务权限和实际目录关联。优先复用现有 Benchmark 精确成员读取与 snapshot 定义接口；禁止用当前最新版替换冻结引用。回归应覆盖无目录、错版本/哈希、权限拒绝和过期响应。真实页面读回与历史 Run/Trial 指纹不变分别留证。

- 当前修复、接口复用和真实验收指针：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/legacy-benchmark-clean-tuning-20261103.md`。
- 源码入口：集成工作区的 `apps/studio/src/products/evolve/benchmarks/BenchmarkContentsStore.ts` 与 `services/evolve-server/internal/modules/evolve/application/queries/benchmark_definition.go`。版本与部署状态以验收记录为准，不从本页推断已合并。
- 题目隐藏属性已获用户批准取消，精确权限/兼容范围见 `output/evolve-unified-20261019/tuning-input-unification-20261103.md`；历史内容与哈希保持，旧题用于调优后按回归统计，不再称独立隐藏验收。匿名分享范围不能随业务读取权限放开。
- 安装与消费仍分开：逐文件回读只能证明配置保存，原始 provider 请求才证明实际消费；模型额度失败应保留缺账与原失败，不能把读取成功称为自主修改或质量通过。

## 同一 Preset 的线上与隔离调用不一定使用相同模型账户

**Why:** 2026-11-03 用户线上同Preset正常回复，隔离调用却收到上游额度错误。只读核对发现实际网关和凭据不同；更换模型后先成功、后又被同一额度错误拒绝。普通Chat页面给共享EVOLVE Thread续接还会带入不同账号身份，触发现有绑定拒绝，不能混算为自主诊断失败。

**How to apply:** 先核对精确Run、模型、实际网关和配置身份，凭据只在内存比较相等性，不输出或复制。区分单次上游错误、整个账户不可用和长请求预占假设；只记录已证实层级，不直接要求用户给另一个账户充值。模型切换需保留原实验条件；EVOLVE会话回到原工作区消息入口，不删除身份校验。旧网关的模型ID/能力目录可能不同，不能只换URL就宣称兼容。

证据仍沿上述验收报告的“用户成功调用后的核对与换模”部分和 `.tmp/tuning-input-unified-20261103/model-endpoint-comparison.json` 回查；不在wiki固化额度、凭据或运行中状态。


## 上游额度错误也要核对目标 dev 当前凭据

**Why:** 2026-11-03 在用户要求按最新dev配置启动后，发现本地与dev实际Pod/ConfigMap的模型配置只有凭据不同；同步现有字段并标准重启后，同一隔离会话连续完成真实模型调用。因此上游额度错误是实际返回，但不能未经配置身份核对便推定用户当前账户需要充值。

**How to apply:** 在内存比较本地、目标环境当前ConfigMap及实际Pod挂载配置，输出差异字段名及是否相等，不输出值。仅同步已授权的陈旧字段，不覆盖本地拓扑、scope或模型选择；凭据备份放忽略目录并限制权限。使用标准入口同步API和唯一Worker，核对真实模型完成事件及账单。恢复调用只证明接入恢复，候选修改和A2A质量仍单独验收。

具体配置比较、重启与调用证据见上述验收报告“最新 dev 配置恢复与真实调优续接”和集成工作区`.tmp/tuning-input-unified-20261103/dev-credential-refresh.json`，本页不保存密钥、余额或会漂移的进程身份。


## 移除公开字段后，回归必须覆盖真实省略输入

**Why:** 2026-11-03 取消题目隐藏属性后，工具Schema已不再要求accessClass，但题目审阅命令在统一构建前仍检查非空枚举。带旧字段的测试全部通过，却遗漏了新正常调用，导致审阅在模型调用前被拒绝。

**How to apply:** 从实际公开Schema构造省略该字段的请求，沿解码、预检查、统一领域构建到真实方法边界检查；保留旧合法值兼容、未知值与越权拒绝。复用已有默认化及验证函数，删除重复前置判断，不新增限制或审批。测试应证明正常路径抵达方法且异常路径没有付费调用，而不是仅检查Schema可解析。

复现、修复和运行时加载状态见上述验收记录及integration的`.tmp/critique-omitted-label-*-20261103.log`；不把本地回归当成已部署。
