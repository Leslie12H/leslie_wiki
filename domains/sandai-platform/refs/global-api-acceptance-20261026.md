---
name: sandai-api-platform-global-acceptance-20261026
type: reference
created: 2026-10-26
updated: 2026-10-26
tags: [sandai, api-platform, postman, testing, billing]
links: [sandai-api-platform, sandai-api-platform-postman-entrypoints]
---

# API 开放平台 Dev Global 联调查证入口

**Why:** 2026-10-26 用户提供 Dev Global 凭据并指定 fake 模型，要求完整联调和列出已调通接口。域名、正常业务成功、错误参数拒绝、任务终态与扣费需要分别取证，不能以接口返回 200 或模型名含 fake 推断全部成功或免费。

## 证据指针

- 当次目标确认、范围、费用、清理和未证实项：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/global-20261026/README.md`。
- 正常调用通过的逐方法/路径清单：同目录 `passed-interfaces.md`。
- 逐用例状态、错误码与断言：同目录两个 `*.results.json`；Postman 原生执行摘要见两个 `*.cli.redacted.txt`。
- 可复查集合及运行入口：项目 `postman/global-*-acceptance.postman_collection.json`、`postman/scripts/build_acceptance.py`、`postman/scripts/live_session.py`。
- 工作区、当前环境模板与基本接口：[Postman 入口](postman-interface-workspace.md)。本页不固化当前地址、模型能力、余额和线上发布状态；下一次从用户授权目标及报告来源重新核对。

## 下次如何判断

- 控制台 Cookie 与生成 Key 绑定各自已确认域名；用户示例的生产地址不能自动当作 Dev 入口，禁止凭猜测扩散凭据。
- 正常请求成功、参数错误按预期拒绝、生成任务进入成功终态、结果链接可用、媒体内容正确，分层报告。负向用例通过不能计为支付/实名/开票正向业务成功。
- fake 名称不构成免扣费承诺；先读余额和用量，生成后再回读对账。生成 POST 结果未知或发现异常时先查询既有任务，不能用重发追证据。
- 参数错误引发 500、非法条件仍受理与模型能力不支持分别分类。没有线上部署 SHA 和具体错误细节时，不把本地校验代码直接当作线上根因证据。
- 只创建独立测试 Key/素材，完成删除与原对象独立回读，保留审计。凭据仅内存输入，清理会话，不写共享环境或导出文件。

**How to apply:** 先查报告的正常调用清单、失败用例和未覆盖范围，按当前目标重新验证。回看旧任务只做 GET；确需重跑生成时明确额外任务与消费。列表契约、供应商业务完成、支付到账、开票文件归档和媒体播放各保留独立验收证据。
