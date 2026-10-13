---
name: sandeval-workbench-context-404-evidence
type: pitfall
created: 2026-10-13
updated: 2026-10-13
tags: [sand-eval, correction, shared-observation, authorization, amendment, read-consistency, evidence]
links: [sandeval-transferred-correction-task-visibility, sandeval-direct-return-interrupted-by-leader]
---

# Sand Eval 工作台 404 与任务事实分层取证

**Why:** 整改处置、当前任务持有人、检查轮次与页面身份解析属于不同环节。工作台在加载原业务内容前还可能经过共享查看接口；其 404 不能单独证明任务不存在。管理员只读查看使用的身份和权限也不同于人员原始会话。当前页面能打开不能证明历史报错根因已被修复。

**How to apply:** 固定源任务、质量任务、处置、轮次、责任人及部署 SHA，先核对持久化事实和当前角色，再核对两侧任务列表与工作台。日志分别聚合原业务 API 与 `/api/workbench-observation/context`，记录明确时间窗口及成功/失败状态。按人员账号只读调用线上代码时，必须同时执行路由权限依赖和处理器；仅调用处理器不能验证完整接口授权。使用独立应用实例、不启动 lifespan 或恢复任务，并开启 Holo DML 拒绝。保留原登录账号、原始网址、请求体和错误正文；仅有来源页面与状态码时，保持历史原因未知，不推断为缓存、旧链接或权限问题，也不据此补派或重建任务。

- 2026-10-13 澳鹏 9.30 声音批次的数据库时间线、身份门禁、浏览器只读查看、接口 404/200 聚合、部署指纹和未知项：[只读取证报告](/Users/leslie/Documents/Playground/sandeval-aopeng-missing-20261013/report.md)。任务状态、人员、部署与报错是否仍发生须从报告脚本和现行环境重新核验，知识页不保存当前结论。
- 入口指针：`sand-eval/platform/backend/app/api/root_observation.py` 的 `open_context` 与 `resolve_owner`；`app/dependencies.py` 的 `require_area`；`app/services/facts/shared_observation.py` 的页面资源与共享授权；`app/repositories/observation.py` 的精确责任人查询；前端 `pages/observation/RootReadBoundary.tsx` 的加载与错误展示。源码会变，按线上 SHA 读取。
- 相邻场景：[改派后的整改可见性](sandeval-transferred-correction-task-visibility.md)、[重复退回与旧轮次只读](sandeval-direct-return-interrupted-by-leader.md)。先确认是否属于对应场景，再复用修复方法。


## 新轮次的读取源对照

**Why:** 新轮次在业务详情和本人列表中存在，入口精确责任人读取仍可能返回空。入口、权威业务读取和列表摘要是不同边界；普通读取与 leader 不一致时，不能把 None 直接当成业务记录不存在。后来原读取自然收敛也不能认定代码已修复。

**How to apply:** 在同一独立应用实例、同一真实人员身份和 DML 拒绝保护下，先跑完整路由门禁与原入口，再用完全相同的 task/review 条件对照普通读取和 leader 读取；保留各次时间和原始结果。继续核对业务 detail、全部/todo 列表与实际浏览器错误。需要验证候选读取替身时，必须同时保留该次原路基线；原路已经恢复时，替身成功只证明兼容，不能证明修复效果。现时重新加载成功与永久修复分开报告；修复应让精确存在性、责任人和授权事实使用一致的权威读取，保留真实查看者与跨空间拒绝，不补派重复记录或绕过鉴权。

- 2026-10-13 刘逸君批次、张靖茹新第 2 轮的普通读取返回空 / 同实例 leader 查到、业务和任务列表、入口 404、后续自然收敛及浏览器恢复：[新轮次只读报告](/Users/leslie/Documents/Playground/sandeval-aopeng-new-inspection-20261013/report.md)。当前状态、部署与是否已修复从现行环境回读；不将本案自动推广到当日上午全部历史错误。
- 读取指针：`app/repositories/observation.py::review_owner`、`app/api/root_observation.py::resolve_owner` 与 `infra/holo.py` 的普通和 leader 连接；列表摘要另看 `quality_inspector_summaries.py` 和 `SupplierInspectionList.tsx`。按线上 SHA 核对。
- 最小改动检查点：精确 `review_owner/disposition_owner` 通过 leader 读取，并核查 `viewer_scope/task_space/quality_target/has_sand_assignment` 的授权事实一致性；保存原有真实查看者和跨空间限制。用“普通读取空、leader 有行”的回归场景验证，不以重建业务记录消除读取问题。具体修复清单与部署变化核对见上述报告的“追问：原因与具体修复”；基础设施触发原因需要同期复制/回放指标，不能仅凭两路 SQL 差异归因。
- 引入点考古：固定提交 [8406e9499](https://github.com/world-sim-dev/sandai-data-smith/commit/8406e94998f40ab18a421e82ed1d79684e2ec293) 把原质量业务读取改成普通 `review_owner/disposition_owner`；经 [main PR #2299](https://github.com/world-sim-dev/sandai-data-smith/pull/2299) 于 2026-10-09 合并并发布。精确编写/合并/生产发布任务时间与证据在上述报告“引入时间与发布证据”；区分历史计算组隔离时间、代码引入时间和部署任务完成时间，不用一个代替另一个。


## 代改保存后的精确答案读取

**Why:** “改后合格”的新答案、修订事实和幂等回执已写入，并不保证普通读取源立即能查到该版本。后端把空结果视为不存在时，编辑器保持未 ready；前端可能因此连纯合格/不合格判断也一起阻塞。此机制与旧轮次继承索引缺失、答案已被后续版本替换分别取证，不能凭错误文案混为一类。

**How to apply:** 固定 QT/RT/RI、检查员和新旧 response_id，先以来源答案行、修订事实和回执证明保存，再核对本轮可编辑性及可见 replacement 引用。记录用户失败请求的精确时间/耗时，使用同部署、同身份、同 SQL/参数比较普通读与 leader；再用不带 join 的主键读取排除关联行遗漏。完整草稿对照按“原路失败 → 独立只读进程临时 leader → 恢复原路再查”的顺序执行，保持 DML 拒绝且不启动恢复。只读替身成功是候选读取方案的证据，不等于生产修复或实际判题写入成功；复制迟滞的基础设施原因需另查同期指标。

- 2026-10-13 徐翰臣、Caption Refine 代改保存后重复 answer-draft 404 的时间线、原生身份错误堆栈、普通读取为空而 leader 有行、完整草稿对照及前端保存门禁：[代改答案只读报告](/Users/leslie/Documents/Playground/sandeval-qc-amended-missing-20261013/report.md)。当前状态、部署和修复进度按现行环境核验。
- 代码指针：`quality/application/inspection/answer_amendment_service.py::prepare`、`app/services/facts/qc_verdict.py::_quality_records/prepare_answer_amendment`、`app/repositories/ev3_qc.py::quality_response_records`、`app/services/facts/answer_amendment.py::prepare`，以及 `StructuredAnswer.tsx` 与 `ReviewWorkspace.tsx::amendmentIssue`。修正精确版本、字段、元信息和固定 execution 的一致读取时，保留账号/范围和冻结版本保护。
- 相邻但不同的成因：[修订索引缺失与质检版本冲突](../refs/sandeval-amendment-lookup-recovery.md)。本案有正确 replacement 且 leader 能完整读取，不能直接套用补齐索引操作。
