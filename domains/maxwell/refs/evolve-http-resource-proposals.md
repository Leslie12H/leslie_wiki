---
name: evolve-http-resource-proposals
type: reference
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, resources, tuning, proposals]
links: [evolve-original-evidence-and-report-recovery]
---

# EVOLVE HTTP 资源提案与候选复测入口

本地实现、失败复现、测试和未完成范围见[2026-10-14 复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-http-resource-proposals-review-20261014.md)。具体测试数量、源码工作树、发布和 Runtime 状态只查记录，不在本页固化为当前事实。

**Why:** 直接评测只冻结执行身份时，Variant 不一定含资源正文；提案只找内联 Prompt 会让合法 HTTP 执行器无法调优。父候选又是相对原基线的替换集合，重新抓当前配置或复制全部资源会破坏归因、撤回已有改动或携带不可编辑文件。

**How to apply:**

- 查 EVOLVE `queries/proposal_resources.go`、`proposals.go` 和 app composition：先授权 Run / 调优来源关系，再以冻结目标及版本读取 Provider；核对清单与成员哈希，不以裸 CAS 哈希授权。Provider 声明资源类别，平台不按 Nextplay 名称或路径推断。
- 查 `ports/resource_provider.go`、`commands/resource_baseline.go`、Nextplay `resource_control.py` 和 `API.md`：可选分类元数据不能无意改变既有基线身份；旧 Provider 未声明类型不代表 Prompt。源不可用不能静默回退当前配置。
- 查 `proposalVariant` 与最终 payload 校验：HTTP 提案保留父候选已有替换、仅新增本次编辑，并明确候选模式；未改只读 / 二进制 / 大资源继续留在冻结基线。不透明元数据不要通过浮点反序列化损失身份精度。
- 查 `queries/diagnosis_resources.go`、`diagnosis.go` 与[归因接线复核](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-diagnosis-resources-review-20261014.md)：归因也要读取冻结 Provider 清单，不能仅修复后续提案。Why：HTTP 基线可无内联正文，父候选替换类别可为 unknown / other，大 Manifest 又可能超过预览大小；把读取失败吞成空列表会误报无可编辑资源。How：先验证受权 Variant 的类型 / 哈希 / 完整清单身份，只取资源名与类别，不拉取大文件正文；旧 Manifest 和引用同样保持可读，来源不可用明确失败，不回退当前目标。跨 Work 访问先核对调优来源；在实际命令链中穿过归因入口，不能只测试直接提案。当前测试 / 发布状态只查复核记录。
- 查 `resource_proposal_flow_test.go`：用真实应用命令串起直接评测、调优来源、目标与候选草稿确认、冻结、准备、异步派发 / 查询和评分；错误实际应用哈希不可获得有效质量分。新调优目标仍走现有审阅流程，不能为测试放宽阶段保护。
- 查 `docs/evolve-http-resource-proposals.md` 与调优技能：自动编辑的模型输入预算、合法 Manifest 序列化上限、原始结果大文件传输是不同边界；合法父候选读取不能误用 Agent 预览限制。大候选编辑需完整授权和应用链，不能靠扩大预览或读取任意 CAS 替代。
- 技术替身证明接线与合同，不证明真实模型效果、自然 Agent 决策或远端配置生效。prepared 与 applied、测试通过与发布、单题与 65 题全量分别验收。

- 2026-10-14：候选复测自动准备、旧计划恢复及冻结清单的容量对齐，见[专项复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-candidate-auto-prepare-review-20261014.md)。Why：把运行必要条件交给前端 Artifact 预览推断，会让可读性故障阻断执行；只移除页面门禁仍会撞上后端容量限制。How：先授权冻结候选再由后端推导准备，保留用户原始请求身份与已接纳 Run 重放；逐层核对准入、Worker 读取、请求编码和原字节验证，完整请求预算包括转义及副本。Agent 草稿、清单和资源正文属于不同容量边界，测试大冻结资产不能宣称大草稿创建通过。当前测试与真实验收状态查记录，不固化在 Wiki。
