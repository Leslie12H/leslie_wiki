---
name: sandai-api-platform-admin-rpm-change-verification-entrypoints
type: reference
created: 2026-10-27
updated: 2026-10-29
tags: [sandai, admin, quota, rpm, postman, testing]
links: [sandai-api-platform-openapi-quota-entrypoints, sandai-api-platform-v2-input-validation-entrypoints]
---

# 管理后台 RPM 修改与恢复验证入口

**Why:** 2026-10-27 用户明确提供 Dev 管理后台并授权修改 RPM 后验证。此前普通控制台 Session 访问配额管理接口被拒绝，不能据此断言独立管理后台也不可用；需沿用户指定后台的登录身份、后端环境、组织归属和保存回执重新查证。

## 回查入口

- 用户提供的管理后台：[Zeus Dev Admin](https://zeus-admin-dev.sandaii.cn/)。通过正常飞书登录/已授予权限的重新授权进入；不要把普通控制台 Cookie 当作后台凭据。
- 组织管理可按关联用户 ID 定位组织，再进入组织详情的调用配额；原 Key 所属用户 ID 和当前 API 会话/Key 需独立核对，不能修改仅凭近似昵称找到的组织。
- 本次精确组织、原覆盖值/继承语义、临时值、恢复结果、后台截图和逐请求证据：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/rpm-adjust-global-20261027/README.md` 与相邻 JSON / PNG / Postman CLI 原件。当前配额和权限回到后台现场查证，本页不固化运行时值。
- 可复用的受控测试入口：项目 `postman/scripts/rpm_adjust_check.py`。有效生成参数的 v2 检查存在限流失效后意外受理/扣费的风险，按当前授权与审批结果执行；不要绕过拒绝。

## 如何再次应用

1. 记录管理后台当前选择的后端环境，核对目标组织与关联用户；再用原测试 Session / Key 确认用户和掩码唯一匹配、余额及任务数。
2. 修改前冻结原 overrides 与 effective。原值是继承默认时，恢复需要重新启用继承，不能把当时解析值硬写成覆盖；只改该组织和用户要求的字段。
3. 填写操作原因，核对保存结果中的 RPM 同步回执和页面读取值；保存成功不等于所有消费者缓存已刷新。
4. 依据代码确认请求是否会进入 RPM 计数点。v1 的空 chunks 请求可在通过创建限流后被业务校验拒绝；v2 的反序列化错误在限流前，不能用它证明创建 RPM 阈值。
5. 看真实调用次数、429 说明的限额、时间窗口恢复和改回后的放行情况。参数 400 仅表明越过限流后被拒绝，不能称生成成功。
6. 恢复前先确认没有其他人并行更改目标配额；恢复原始继承/覆盖值，刷新回读并再次验证，再核对余额和任务数。截图不得含完整 Key、Cookie 或未遮蔽联系资料。

**How to apply:** 先沿报告查看本次实际阈值、恢复和费用，不以后台展示代替运行时证据。将只读查证、组织级配额修改、有效生成和恢复分别授权/留证，出现不确定结果先回读，不重复保存或重复创建。

## 2026-10-29 RPM 与并发同时设六的验证边界

**Why:** 用户将另一个目标账号的 RPM 与任务并发都设为六并要求验证。创建请求先被 RPM 拦截时，不能把第七次 429 当作并发槽位上限或排队证据。

- 当次目标组织/Key 匹配、后台六/六展示、六次受理与第七次拒绝、并行 GET 快照、终态及正式费用回查：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/quota6-dev-cn-20261029/README.md` 和相邻 JSON / PNG / CLI 原件。受控入口 `postman/scripts/quota6_dev.py`，只读后台，不改用户配置。当前额度和状态回到线上或报告原件核验。
- 六个已受理任务的公开 processing 快照可证明达到六个处理中的能力，不能独立证明第七个已受理任务一定排队；公开 processing 也不等于 GPU/物理 worker 占用。短窗口并行查询与原子内部槽位观测分别报告。
- 真正验证“超过六则排队”需要七个以上已受理任务与重叠的执行时间，并排除创建 RPM 提前截断；测试设计应先拆开创建频率、受理队列、公开状态和真实槽位，保留配置/缓存传播的实际边界。

**How to apply:** 固定准确用户/组织和 Key，先读配置，再记录真实请求数、窗口内受理/429、每次 GET 的时间范围与状态；把“达到六”与“严格封顶六”分别判定。未得到内部槽位或超额队列证据时明确未完整验证，不靠源码或展示值填补运行时证据。
