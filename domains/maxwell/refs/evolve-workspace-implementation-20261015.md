---
name: evolve-workspace-implementation-20261015
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, studio, ui, validation]
links: [evolve-commercial-ui-20261015, evolve-continuous-workspace-layout-20261015]
---

# EVOLVE 连续工作区实装与验证入口

2026-10-15，用户授权按原型的布局在 Maxwell 项目中开始实施，明确要求融合项目 token，不逐像素照抄原型。此前关于暖色、边框与投影的反馈仍有效；实施授权不等于最终视觉认可。

**Why:** 原型只能说明组织方式。落地要让已有 Case、Benchmark、Run、指标修订和候选证据在同一阅读路径中工作，并保持 Maxwell 的表面、文字、控件和阴影层级。

**How to apply:** 从当前代码和下方验收记录核实实现范围；采用同一外层工作面、上方趋势与下方记录、指标分组内比较运行。用冻结身份关联结果，不凭相同名称合并指标或用例。统计未读到不能写成没有运行，缺失值不能补零。任务当前草稿的 Case 清单也不能替代历史 Benchmark 的冻结用例。

## 指针

- 本轮实现与真实浏览器验证：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-layout-implementation-20261015/README.md`。截图、检查命令、受测记录、范围限制和本地服务入口均在该记录；可变状态以现场为准。
- 视觉系统：`apps/studio/src/styles/tokens.css`、`src/components/composite/TableFrame/TableFrame.tsx`、`src/products/evolve/v3/workspace.css`。
- Benchmark 综合趋势与汇总读取：`src/products/evolve/benchmarks/BenchmarkMetricsOverview.tsx`、`BenchmarkOverviewStore.ts`、`benchmarkOverview.ts` 及相邻测试。
- 指标分组与冻结用例回归：`src/products/evolve/v3/matrix/MetricVersionMatrix.tsx`、`matrixMetrics.ts`、`matrixModel.ts` 及相邻测试。
- 对象趋势与记录、任务上下文切换：`src/products/evolve/v3/lineage/EvolutionMetrics.tsx`、`src/products/evolve/v3/ledger/TaskSidePanel.tsx`。

本轮为前端本地实装验证，真实服务数据仅只读浏览；未新建评测、发送 Agent 消息、应用候选或部署。不要把截图中的旧 Run 当成本轮执行结果。

## 2026-10-15 用户否定首版后的纠正

用户明确否定首版实装：保留旧顶部导航、把用例与评分合并、Benchmark 空列表占据整页，都没有实现已讨论的原型。不能将接口接通、检查通过或局部上下排列称为整个布局落地。

**Why:** 借鉴 LangSmith / Opik 的重点是对象归属、持续的页面上下文和汇总到证据的阅读路径。只换外框和 token 会让领域关系继续零散。

**How to apply:** 原型左侧五个一级入口按用户明确顺序保持：接入对象、Benchmarks、调优任务、用例库、评分资产。前三项属工作区，后两项属评测资产。用例库内含用例与用例集，评分资产内含指标、评分标准与评分方法；不能再次合并成用例与评分。Benchmark 内看评测记录、冻结用例、评分标准与版本；调优任务内看基线、候选和验证证据。Maxwell 的颜色和控件 token 与这些信息架构决策分开处理。

- 本次纠正的实现范围、截图、验证和限制：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-layout-correction-20261015/README.md`。以此记录和当前代码核实状态，不将本次截图视为用户最终认可。
- 导航归属入口：`apps/studio/src/products/evolve/v3/EvolveNavigation.tsx`、`routes.ts`、`library/LibraryPage.tsx`。
- Benchmark 冻结内容：`apps/studio/src/products/evolve/benchmarks/BenchmarkContentsStore.ts`、`v3/library/BenchmarkContentsPanel.tsx`。现有契约没有独立产物的反向查找，读取只做有界目录/历史修订解析；无法定位时保留引用并显示不可读，不能用最新修订替换冻结版本。


## 2026-10-15 先推导布局，再制作交互原型

用户进一步明确：需要融合 LangSmith 与 Opik 的优点，而非概念映射或局部补丁；导航也可重新考虑，出发点是所有内容可管理、可修改且路径明确。随后要求先思考，再交付可点击原型。五个入口因此是待验证的导航提案，不是不可调整的约束。

**Why:** 整体性来自同一对象范围下的汇总、选择、记录与证据相互解释。可编辑资产、冻结评测口径、目标版本和结果证据各有生命周期，不能通过平铺菜单或独立卡片代替这些关系。

**How to apply:** 设计依据、官方来源、导航提案、版本关系、原型源码和浏览器验收见[连续工作台原型记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-continuous-prototype-20261015/README.md)。重点核对两条路径：趋势/比较→退步用例→证据→带基线创建调优；资产修订→更新用例集或评分标准→显式更新 Benchmark。颜色和投影直接复用 Maxwell tokens。比较、谱系和评测记录作为工作视图，管理入口提供集合、详情、修订与引用；这是一份待评价提案，不代表业务 UI 已完成。

本次原型使用本地示例数据，可保存资产修订、组合与任务草稿；不会执行真实评测、评分或应用候选。公开产品资料只读研究与本地原型交互验收分别记录，不能互相替代。


## 2026-10-15 原型图表的比例问题

**Why:** 固定 SVG viewBox 配合非等比铺满容器，会把图中的文字和圆点一起拉伸；只在单一窗口检查无法发现超宽屏的失真。

**How to apply:** 图表几何坐标按容器实际尺寸计算，字体、点径和线宽保持 CSS 像素大小；验证正常、窄屏和宽屏下的字体、圆点比例与选择联动。具体实现与测量证据见上述连续工作台原型 README 的“图表比例修复”部分。修复只属于原型，不代表业务图表已经同步修改。
