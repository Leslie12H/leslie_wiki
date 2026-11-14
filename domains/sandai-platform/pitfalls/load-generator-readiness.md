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

逐窗口漏发与全程平均发送率分别验收；短测通过不能覆盖后续持久化尾延迟。优化查询台账时保留每次请求意图/回执，通过组织、任务和原始序号关联完整输入，状态不变无需重复整份输入。批量 fsync 的等待仍须在请求发送前完成，记录同步尾延迟定位发压端瓶颈，不放宽漏发门槛来制造通过。

持续写 NAS 台账会增加文件缓存，cgroup `memory.current` 接近 limit 不等于进程工作集同样饱和。保留总量并用 `memory.current - inactive_file` 展示工作集，依据 [cAdvisor 计算](https://github.com/google/cadvisor/blob/8164b38067246b36c773204f154604e2a1c962dc/container/libcontainer/handler.go#L835-L844)。未知或不一致采样不补成健康；工作集指标也不是 OOM 风险的完整证明。

容量、持久化同步延迟和资源创建权限分别验收。NAS `df` 展示的逻辑容量不证明独占配额或同步写入延迟；没有 Available PV 也不证明整个云账号没有空闲云盘。云盘最低容量与性能级别有关，沿当时官方规格核对，不把某一等级下限推广到全部云盘。`kubectl auth can-i create pvc/pod` 不证明能够创建 StorageClass，更不证明 CSI 云角色有 CreateDisk/AttachDisk 权限、账户额度或已获新增费用授权；不得用付费创建试探权限。具体占用、权限核验、候选规格、保留时长与报价边界见工作区 `docs/magi2-essd-candidate-plan-20261114.md`。

## 证据入口

- 历史 Dev 执行位置和共享资源边界：工作区 `docs/dev-multitenant-load-report-20261028.md`。
- 当前两区接线、配额、素材、真实遥测、阻塞和正式步骤：工作区 `docs/production-load-final-readiness-20261114.md`；早期待命部署记录在 `docs/magi2-runner-readiness-20261114.md`。实时位置和状态沿本次独立回读，不在知识库固化实例、Pod、版本或测试计数。
- 人工启动/暂停/继续/停止、持久化命令回执、断开终端与 Pod 故障后的区别：`postman/load/magi2/deploy/README.md`、`control.mjs`、`launch.mjs`。
- 成功延迟窗口与样本门槛：`latency-gate.mjs`、区域配置与相应 tests；失败/超时不得混入成功分位数，查询成功不代表生成成功。低流量 P99 基线和统计充分性须明确标识。
- 缺真实遥测、身份、准入、素材映射或输入契约时阻止生产启动；模板填 true、旧看板有序列或本地测试通过不构成生产验收。停新增后保留原台账和只读续查，不自动重放 POST。
