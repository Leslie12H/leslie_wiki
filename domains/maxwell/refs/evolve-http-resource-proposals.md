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

- 2026-10-14：Agent 大草稿创建、人工审阅、冻结与修订的容量收敛，见[专项复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-draft-capacity-review-20261014.md)。Why：已冻结大候选可运行不代表 Agent 能创建同样内容；数据库 JSONB 格式空格还可能让合法草稿保存后无法确认。How：分别核对完整请求、紧凑 payload、对象自身和物理存储上限，穿过实际起草 / 人工确认 / 冻结入口，再验证修订不覆盖历史。大内容按题、按文本页读取，折叠内容延迟挂载；完整 Unicode、末页可达、陈旧审阅失效及权限不能因性能优化丢失。本地数据库验证、SSR 和真实浏览器交互分开记录；浏览器不可用不宣称视觉通过。当前代码、迁移与验收状态仅查记录。

- 2026-10-14：Provider 配置身份与 Case 准备的通用边界，见[专项复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-provider-config-identity-review-20261014.md)。Why：合法的 Provider JSON 值可能是对象、数组或大整数，语言直接比较或浮点解码会导致异常或误用格式。How：按声明数据比较，保留数值身份；同时核对表单 / 导入 / 草稿入口及保存后的目录离线重放。不将其他 Provider 的兼容性问题归因为 Nextplay 字符串版本的历史执行失败；测试、当前改动和真实评分状态只查记录。

- 2026-10-14：草稿审阅的窄侧栏与主区域适配，见[浏览器验证记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-draft-review-layout-20261014.md)。Why：宽窗口里的窄侧栏不会触发视口媒体查询，选题栏仍可能被按钮挤压；单纯 SSR 不证明能读完大材料。How：按实际容器宽度重排，在真实组件中检查末页及末行、切题、版本更新后的再审阅和只读权限；普遍性提示不能遮住内容，具体缺规则提示仍保留。Chrome 不可用时应用内浏览器可做隔离组件技术验证，不将其改称自然 Agent 或真实保存验收。运行条件和截图只查记录。

- 2026-10-14：原件归档失败分类与报告摘要身份，见[专项复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-evidence-integrity-review-20261014.md)。Why：逐块正确不保证整文件正确，底层普通错误会让上层反复重试不可恢复的同一原件；浮点解码也可能让不同的 Provider 详情标识看似一致。How：沿执行与评分的所有归档调用方传递既有完整性错误类型，分别验证损坏原件停止、暂时中断续传以及已完成评分不重跑；不透明 JSON 数字不经过浮点转换。当前范围、失败证据与真实验收边界只查记录。

- 2026-10-14：异步评分状态存储中断的错误分类与 Worker 接管，见[专项复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-measurement-recovery-review-20261014.md)。Why：Provider 调用的普通存储异常可能在 Method 映射中变成最终失败指标，从而失去已接纳任务的恢复机会。How：分别检查创建、accepted、completed、owner 读取及取消意图的写前 / 写后不确定结果；内部恢复信号穿过 Method 到 Run 编排，沿同一调用身份恢复，确定的身份冲突与协议错误保持终止。测试必须先证明实际触达故障，再验证租约接管、冻结输入和不重复执行；替身分数不等于真实取分，局部恢复不等于所有持久化阶段均已恢复。具体源码、测试和未完成验收只查记录。
