---
name: sandai-api-platform-load-generator-readiness
type: pitfall
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, api-platform, performance, runner, readiness]
links: [sandai-api-platform-performance-testing-entrypoints]
---

# 发压器存在、调度达标与生产就绪分开验收

**Why:** 复用 Kubernetes 资源不必购买机器，但 Pod Running 不能证明调度、图片传输、持久化记账或公网吞吐合格。2026-11-14 的回环自检发现逐请求 fsync 与相对 sleep 都能使实际请求率明显低于配置目标；也遇到选定节点不能挂载某 NAS、不能拉取公共镜像、静态前端镜像不包含 Node 的部署差异。

**How to apply:** 先查看历史执行报告，再核对现有节点余量与实际镜像/存储能力；用独立限额 Pod 和专用持久目录，显式覆盖待命命令。用真实图片、真实 HTTP 回环、实际磁盘同步检测发压端；同批持久化同步必须仍保证请求意图先落盘，时钟采用固定时间点，过期请求不集中补发。按实际发送/漏发与服务端观测分别判断，不能把回环吞吐当作生产或公网容量。

## 证据入口

- 历史 Dev 执行位置和共享资源边界：工作区 `docs/dev-multitenant-load-report-20261028.md`。
- 当前两区发压器、版本、主流程和未解决项：工作区 `docs/magi2-runner-readiness-20261114.md`；实时位置和状态沿本次独立回读，不在知识库固化实例、Pod、版本或测试计数。
- 人工启动/暂停/继续/停止、持久化命令回执、断开终端与 Pod 故障后的区别：`postman/load/magi2/deploy/README.md`、`control.mjs`、`launch.mjs`。
- 成功延迟窗口与样本门槛：`latency-gate.mjs`、区域配置与相应 tests；失败/超时不得混入成功分位数，查询成功不代表生成成功。低流量 P99 基线和统计充分性须明确标识。
- 缺真实遥测、身份、准入、素材映射或输入契约时阻止生产启动；模板填 true、旧看板有序列或本地测试通过不构成生产验收。停新增后保留原台账和只读续查，不自动重放 POST。
