---
name: sandai-api-platform-v2-input-validation-entrypoints
type: reference
created: 2026-10-26
updated: 2026-10-26
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
