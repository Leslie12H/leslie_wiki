---
name: sandai-api-platform-dual-region-native-ark-smoke-entrypoints
type: reference
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, production, smoke, native-v2, ark, identity, media]
links: [sandai-api-platform-v2-input-validation-entrypoints]
---

# 双区原生与 Ark 接口冒烟查证入口

**Why:** 生产冒烟要分别验证上传、两套创建、两套查询和真实成片。相同模型白名单不保证两个入口具有相同的国内准入路径；公开权限错误也可能掩盖实名校验原因。任务成功和成片参数一致属于不同验收项。

## 证据与源码指针

- 本轮请求参数、精确任务/资产 ID、HTTP/code、request ID、终态和成片检查：`/Users/leslie/Documents/ChatGPT/Apipltform/docs/production-dual-region-smoke-20261114.md`。对应私有回执目录在报告中；不要复制 API Key、Cookie 或签名视频链接到知识库。
- 当前部署镜像与 Git SHA 以该次报告/Pod 读回为准。源码仓库 `world-sim-dev/zeus`，沿 `ArkGenerationController`、`OpenApiGenerationService`、`OpenApiTaskEnqueueService`、`TaskDomainServiceImpl`、`DomesticAccessService`、`AlipayIdentityService` 跟踪创建链路，再核对 `ApiErrors` 的错误映射。不要只凭 403 的展示文案断定模型白名单缺失。
- 查询展示沿 `ArkGenerationController.addVideoSpecs` 检查整数时长处理；视频实际时长、画面规格和音轨以 `ffprobe`、完整解码、音量检测的回执为准。请求中关闭音频时应检查输出是否仍含非静音音轨。

**How to apply:** 每区冻结独立测试组织、模型版本、素材哈希和请求参数，明确限制创建次数。未知 POST 结果不重发；已受理任务只读追到终态。交叉查询同一个任务有助于检查两套表示的一致性，但不能替代被拒绝接口的成功创建。记录首次观察到成功的时间，不能把轮询上界当成精确任务耗时，更不能用单样本推算 p95/p99。准入失败先核查模型白名单、组织所有者和认证记录，再由接口契约决定修复；不为让冒烟通过而伪造认证数据或放开全局权限。
