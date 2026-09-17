---
name: sandeval-sql-lock-diagnosis
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [sandai-data-smith, sandeval, hologres, sls, sql, locks]
links: []
---

# Sand Eval SQL 与锁诊断入口

**Why:** 2026-09-17 排查确认，单搜 slow SQL、deadlock、lock wait 会漏掉真正的慢 SQL 与锁获取失败；应用事务阶段计时和数据库异常原文需要共同核验。

**How to apply:** 固定北京时间窗口，区分 Sandworm 与 Eval 日志库、生产与开发 Pod 前缀；只统计 transaction_trace 的 finish 事件，并区分 SQL、加锁、连接池和写入准入阶段。日志行、trace、独立请求不能混算。

## 指针

- 全局访问技能：`~/.codex/skills/sdh-infra-access/SKILL.md`。用操作者自己的授权配置；技能中的历史部署和采集映射须现查。
- Eval日志：[data-operator-log](https://sls.console.aliyun.com/lognext/project/k8s-log-c7a4a4cf4049c494ca6dea4aaf1e7f9b9/logsearch/data-operator-log?slsRegion=cn-shanghai)，过滤 namespace=sandworm、pod=sandeval*；sandeval-dev-前缀单列。
- Sandworm日志：[sandworm](https://sls.console.aliyun.com/lognext/project/k8s-log-c7a4a4cf4049c494ca6dea4aaf1e7f9b9/logsearch/sandworm?slsRegion=cn-shanghai)。状态updated_at冲突不能当数据库锁证据。
- 数据库：[Hologres实例控制台](https://hologram.console.aliyun.com/cn-shanghai/instance/hgprecn-cn-y1i3x6u00004/info)，进入HoloWeb核对历史慢Query及阻塞会话。控制台可见不等于数据库可登录。
- 2026-09-17固定窗口证据、SQL指纹、代表性trace及复查查询：`/Users/leslie/Documents/Playground/output/sdh-log-audit-20260917.md`。该文件是历史核验，不代表当前健康状态。

## 证据解释

- Hologres锁获取失败可能写为 `Cannot acquire lock in time`，异常类别可能是 `InternalServerError / XX000`；不能只搜Deadlock或LockNotAvailable。
- 解析content中的transaction_trace JSON。`phase=sql`的`elapsed_ms`是应用观测的SQL调用耗时；`business_phase`可进一步区分submission_task_lock、submission_assignment_lock等路径。名称只用于定位，数据库锁异常原文和阻塞信息才证明锁行为。
- statement timeout、用户请求取消、锁获取超时需要分别统计，不能仅凭QueryCanceledError混为一种错误。
- 把长事务、加锁耗时、连接池耗尽串成因果链前，必须关联持锁owner、等待者、SQL及时间窗；Ready和重启次数只说明容器状态。
