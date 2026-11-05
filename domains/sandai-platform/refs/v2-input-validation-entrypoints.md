---
name: sandai-api-platform-v2-input-validation-entrypoints
type: reference
created: 2026-10-26
updated: 2026-11-05
tags: [sandai, openapi, v2, validation, testing, quota]
links: [sandai-api-platform-openapi-quota-entrypoints, sandai-api-platform-global-acceptance-20261026]
---

# v2 生成接口参数校验与 quota 权限查证入口

**Why:** 2026-10-26 用户要求调整 quota 复测，并指定 v2 创建/查询接口，检查非法参数与漏传是否正确报错。需区分普通登录、管理员配额写权限、同步拒绝和异步任务失败，避免把 202 或 HTTP 200 当作业务成功。

## 回查证据

- v2 参数专项：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/v2-validation-global-20261026/README.md`，相邻 `results*.json`、`cli*.redacted.txt`、`before*.json` 和 `after*.json` 为逐请求和费用原件。当前缺陷、任务、余额和覆盖范围只沿报告核验。
- 生成入口：项目 `postman/scripts/build_v2_validation.py`；运行集合：`global-v2-validation.postman_collection.json`，只读补查：`global-v2-validation-get.postman_collection.json`。发生意外 2xx 受理后停止 POST，后续只查原 taskId，不重发来复现。
- 只读补查在启动前强制检查集合所有 method 均为 GET，不能依赖集合名称或字符串替换推断只读；此次脚本误重复与修正沿专项报告查证。
- quota 调整准备、服务端权限预检和恢复范围：同项目 `postman/reports/quota-adjust-global-20261026/README.md`、`permission-preflight.json`。不能以资料查询 200 或浏览器已登录推断拥有 quota 管理权限。

## 源码入口与方法

源码根为工作区 `zeus/`，重新核对版本后查看：

- `modules/openapi/.../v2/generations/GenerationRequestDeserializer.java`：必填、类型、重复字段、parts、图片引用和任务 ID 的结构校验。
- `modules/openapi/.../v2/error/ApiErrors.java`、`ApiErrorResponse.java`：公开 code/message/details 与 HTTP 状态映射；参数报错应定位字段，不能透出内部堆栈。
- `modules/domain/.../modelconfig/ModelVariantSelector.java`：参数组合与模型能力选择；空约束列表是通配。检查配置约束和结构校验的职责，不能只查字符串非空就认定枚举值有效。
- `modules/domain/.../modelconfig/ModelOptionResolver.java`：请求选项覆盖配置选项；追踪非法值是否到达组装/入队，而不是只看 API 反序列化。
- `modules/api/.../admin/AdminOrganizationQuotaController.java`：超级管理员权限、按组织读写与 null 继承语义。组织身份不能从 userId 猜测，也不能将管理员自身组织当作原测试 Key 的组织。
- 如已在用户授权范围内创建独立临时 Key，`ApiKeyCreatedVo` 的创建回执含 orgId/userId，可用于解析目标归属；完整新 Key 不打印、不保存，随后删除并回读。不能为绕过 403 修改管理员白名单或改全局默认配置。

**How to apply:** 先校验既有凭据与目标域名，冻结调用前的任务数和余额。逐项检查漏传、null、错误类型、非法枚举、鉴权与对象 ID，保存精确 code/message/details。断言口径偏严与真实输入校验漏洞分开裁定；保留原始失败，不改写记录。发现 202 意外受理就只读追到终态及消费；配额无权限时保留原值，等待有权限的会话。

## 2026-11-03 余额不足与失败记录

**Why**

Staging 国内的 v2 创建请求曾返回 HTTP 400 `insufficient_credits`，同时在 `details.generation_id` 给出编号。用同一把 Key 查询该编号得到 HTTP 200，任务状态为 `failed`，错误码同为 `insufficient_credits`，且无产物。历史回执见 Codex 会话 `01a17716-5782-7573-be72-a6f73fd06b31` 中 2026-11-03 的 Staging 视频生成复测。

**How to apply**

复测时保留 POST 的 HTTP 状态、错误码及任务编号。若错误响应带编号，对同一环境和编号执行一次只读 GET，区分创建请求被拒、失败记录是否可查和任务是否受理执行。扣费或余额变化另查账本。代码回查入口为 Zeus 的 v2 `ApiErrors` 和 `/v2/generations/{id}` 查询路径，具体映射以当前部署验证为准。

## 2026-11-05 Dev 文本审核抽样

**Why**

题库的拒答标签与生成 API 的审核策略是两套判定。Dev v2 实测中，题库拒答样本同时出现了创建阶段的 `content_policy_violation` 和受理后生成成功。具体分类、行号、请求 ID 和任务终态见 2026-11-05 的「Dev 内容审核抽样」会话。一个被拦截的样本能证明该路径实际执行了拦截，题库标签差异是否属于漏拦需要按当前审核规则核实。

**How to apply**

固定 Dev 环境、已授权测试 Key 和模型，从文本题列按类别随机抽取正负对照，用工作表名和单元格位置回查样本。创建阶段以 `content_policy_violation` 与 `details.field` 定位输入拒绝，对响应中的每个任务编号执行只读 GET，分开记录创建回执、终态和产物。代码沿 Zeus 的 `OpenApiGenerationService`、`TaskInputModeration` 与 `ApiErrors` 核查审核、派发和错误映射。按当前部署核实具体策略与白名单，按账本核实费用。

## 2026-11-05 逐项审核记录与数美路由

**Why**

Zeus Dev 管理后台任务详情的总体审核状态 `PASS` 可覆盖逐项审核 `PASS` 和 `SKIPPED`。2026-11-05 复核年龄、职业与地域三个样本时，限定任务和组织的 Dev 只读查询显示，前两条的 `prompt` 均有逐项 `PASS` 和审核请求号，地域样本为 `REJECT` 且失败阶段为 `INPUT`。个案回执见同日「Dev 输入审核明细」会话。审核引擎给出通过和通过是否符合产品规则需要分别裁定。

**How to apply**

在香港 Dev 后台先用精确任务 ID 核对组织和总体状态。需要区分放行与豁免时，只读查对应 `task.moderation.inputTexts`，核对 `key`、`status`、`requestId` 和 `skipRule`，用被拦截样本对照。查询只取指定任务的审核投影，避免导出凭据或提示词原文。

[审核策略页](https://zeus-admin-dev.sandaii.cn/platform/moderation) 的「指定账号使用数美」按账号 ID 配置，页面注明覆盖本人及名下组织的后续 OpenAPI 请求。通过原任务的组织归属定位所有者，再按精确账号 ID 保存与回读。名单、默认供应商和豁免是独立配置。传播时限以页面为准，保存回读和新请求实际路由分开验收。

## 2026-11-05 数美路由复测

**Why**

账号名单回读只能验证配置已保存。2026-11-05 使用相同 Dev Key、模型、参数和五条题库文本复测，年龄、职业样本由放行变为输入拒绝，地域样本继续被拒，两条非拒答对照均完成。逐条任务和回执见同日数美复测会话，单批样本不代表供应商总体覆盖率。

**How to apply**

从 Dev OpenAPI 工作负载日志先用精确任务 ID 找 trace，再用同一 trace 核实 `ShuMei moderate text` 入口及结果日志。配置回读、时间相近的日志、逐任务 trace 关联和最终任务状态应分别保留。仅保留任务关联与供应商标识，避免导出原文和凭据。

## 2026-11-05 Dev 数美分层抽测

**Why**

五条同题复测证明了账号配置可改变实际审核结果。扩大覆盖时，预先锁定拒答和非拒答分层，才能分别看到拒答放行与正常输入误拦。2026-11-05 的 20 条样本在当前数美路由下均符合题库预期。每类仅抽一条，覆盖以抽样明细为准。

**How to apply**

先记录抽样种子、源文件哈希和工作表单元格，排除之前已用的样本及重复文本。按已知 Dev 限流分批发送，保留创建 trace，逐条匹配同一 trace 的数美审核入口、返回日志和任务编号，再与只读终态交叉核对。本次逐类结果、原始请求回执和 trace 截图见工作区 `.local/dev-shumei-20261105-20/`，以相邻 `README.md` 为入口。

## 2026-11-05 Base 拒答题导入

**Why**

审核用例表将文本内容与素材生成提示词分列。按表格字段直译可能将拒答题误放到素材生成提示词列，需要先核对现有文本用例和预期字段语义。

**How to apply**

目标入口为 [MAGI-2 用例表](https://j0yswlgboxz.feishu.cn/base/O4AQbFHynaaPMasxtGUcgrElnGd?table=tblatlQqvDrJNPrW&view=vewytkCwBB)。用 lark-cli 的用户身份解析链接，读取实时字段和现有记录，沿现有文本用例确认 `content` 承载测试文本、`expected` 复选框表达预期通过与否。字段会变，写入前重新核对。来源为题库拒答标签时，写入预期不过审不代表已实测拦截。

按源文本和目标表已有文本去重后随机抽样，批次、源行号及分类写入现有备注与测试点字段，保存随机种子和源文件哈希。新增回执按 record_id 集合回读，比对全部提交字段。2026-11-05 的 200 条导入证据见工作区 `.local/feishu-magi2-refusal-200-20261105/`。
