---
name: sandai-api-platform-ten-video-key-acceptance-entrypoints
type: reference
created: 2026-10-29
updated: 2026-10-29
tags: [sandai, openapi, api-key, dev-cn, postman, testing]
links: [sandai-api-platform-admin-rpm-change-verification-entrypoints, sandai-api-platform-development-entrypoints]
---

# 新 Key 十视频验收入口

**Why:** 2026-10-29 用户提供新 Key 要求生成十个视频，随后指定 Dev CN，并明确其与此前 Dev Global 生成入口相同。不能因前端地区或管理后台环境名称不同，猜测新域名或跨环境发送凭据；也不能将模型创建 403 当作 Key 无效。

## 回查入口

- 当次用户确认的精确地址、模型参数、首条响应、GET 鉴权结果和尚未完成的边界：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/ten-videos-dev-cn-20261029/README.md` 及相邻 JSON / CLI 原件。运行入口为 `postman/scripts/generate_ten_dev.py`，本地 Dev CN 环境为 `postman/environments/dev-cn.postman_environment.json`。这些是当次证据；当前地址、Key 状态、模型权限与价格需现场核验。
- 同一 Key 的只读不存在任务查询与创建请求分别验证鉴权和模型使用路径。实际 HTTP / code 以报告原件为准；公开错误文案与内部拒绝来源未必一一对应，根因需进一步沿准确组织和部署查证。
- Dev CN 当前浏览器账号与用户提供 Key 的归属需要用服务端 Key 列表/准确组织独立匹配。当前账号 Key 列表为空时，不能擅自将 Key 归属该账号，也不能创建替代 Key 绕开原问题。
- 管理后台配置可从“平台配置 → 模型配置”现场读取；旧详情 URL 可能重定向。PUBLIC 展示与创建拒绝矛盾时保留两者证据，不静默修改权限或扩大白名单。

**How to apply:** 第一个有效请求计入用户要求的十个；非受理响应立即停止，不继续消耗其余请求。POST 结果未知时不重放，保存阶段启动标记和任务回执；GET 轮询只使用已受理 ID。受理、成功终态、视频 URL 与正式扣费分别核对。完整 Key 仅存在内存，签名结果放忽略目录，报告不得含凭据。fake 验收不用于推断真实视频画质或推理性能。

## 2026-10-29 同参数 Key 对照与十个任务验收

**Why:** 用户在首把新 Key 受拒后，明确要求用原 Key 对照，再提供另一把 Key。不能将同入口上的某一 Key 拒绝直接泛化成环境或模型整体不可用；也不能以单个 202 代替原始十视频目标。

- 三把 Key 的当前响应矩阵、对照任务、最终十个受理 ID、GET 终态及逐条用量金额，回查上方同一报告的最新版本和 `old-key-comparison/`、`latest-key-comparison/` 子目录。首把 Key 的拒绝内部原因仍沿准确组织和部署查证，不以其他 Key 成功倒推根因。
- 最后 Key 的第一个成功任务计入十个，再补九个。账单读取前先将其掩码与当前控制台 Key 列表唯一匹配，再按服务端 Key ID 查询用量；以创建回执 ID 集合与正式用量 taskId 集合相等检查完整性，额外的旧 Key 对照与最终十个分别核算。
- 签名视频链接仅存报告指向的忽略目录，过期后重新 GET 刷新，不复制到知识库或提交。

**How to apply:** 固定同域名、模型和参数，仅替换用户授权的 Key 来对照；先完成受理/终态再恢复原始数量目标。保留失败断言和旧 Key 对照记录，按最终 Key 的精确任务集合核算费用，不将不属于同一账号的余额混在一起。

## 2026-10-29 另一账号二十任务入口

**Why:** 用户随后明确提供另一账号的 Session / Key，要求一次完成二十个任务。不能继续使用前一账号的浏览器身份、余额或 Key ID 归属来验收新批次。

- 精确账号匹配、初始余额、二十条创建回执、GET 终态及正式账单核对入口：工作区 `postman/reports/twenty-tasks-dev-cn-20261029-account2/README.md` 和相邻 JSON / CLI 原件。当前参数、余额和任务结果回到报告或线上重新查证，本页不固化运行时状态。
- 可复用的受控入口是 `postman/scripts/generate_ten_dev.py --batch20-other-account`。Cookie Session 与 Bearer Key 分别隐藏输入并仅留在内存；先用 Session 读取用户和 Key 列表，确认掩码唯一匹配且启用，再固定该服务端 Key ID 核算本批消费。

**How to apply:** 二十个创建请求属于同一集合，不额外创建烟测任务；以持久启动标记防重复提交，以真实受理 ID 集合对应仅 GET 查询和正式用量 taskId 集合。批次费用与余额变化分别核对，不用账号累计消费替代本批金额；保留所有失败或结果未知状态，不以 CLI 退出码单独宣称完成。
