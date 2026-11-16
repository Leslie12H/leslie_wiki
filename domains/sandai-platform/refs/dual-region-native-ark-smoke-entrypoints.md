---
name: sandai-api-platform-dual-region-native-ark-smoke-entrypoints
type: reference
created: 2026-11-14
updated: 2026-11-16
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

## 2026-11-16 国内方舟 Python SDK 查证

**Why:** SDK 会把任务资源路径拼到调用者配置的 `base_url` 后。文档路径、旧别名和后端短路径可能命中不同的网关规则。同一组织和同一任务在不同路径上的对照可以定位失败发生在哪一层。

**How to apply:** 先记录 SDK 版本，用同一组织 Key 对同一已知任务只读查询，再用明确无效的创建体比较错误契约。保留 HTTP 状态、Content-Type、Via 和 X-Request-Id，遇到无业务回执的 HTML 503 要回查网关规则。需要验证有效创建时显式选定已确认可达的路径并关闭 SDK POST 重试。查询字段的 Unix 秒值还要与客户端观测时间对照，避免只有类型通过。SDK 请求体是否带默认 null 可以用带虚拟 Key 的本地 HTTP transport 验证。

- 文档路径、短路径、默认 null 请求、真实生成和响应时间戳对照见工作区 `.local/ark-sdk-cn-20261116/REPORT.md`。脱敏回执与复现脚本在同一目录。路由和模型准入按本轮生产部署重新核对。

## 2026-11-16 上海网关迁移与时间戳复核

**Why:** Ark 迁移同时涉及应用映射和独立发布的公网 Ingress。应用文档跟随提交更新，生产入口可能仍在旧版本。任务创建可由 Java 显式写时间，状态流转又可由 MySQL 按会话时区生成时间，同一张表的两个字段因此可能使用不同时间口径。

**How to apply:** 沿 Zeus [PR #491](https://github.com/world-sim-dev/zeus/pull/491) 的 `ArkRoutes`、`deployment/magi/README.md` 和 `ark_ingress_patch.py` 核对发布步骤，连续用同 Key 同任务读回切换前后状态，并在 ALB 监听中核对匹配路径、后端与默认组。时间偏移先比对原生响应和独立 JDBC 读回，再核对 SQL 是否显式写 UTC、列是否为 DATETIME 和 JDBC 驱动配置是否实际设置了 DB 会话时区。验证修复时兼顾旧行和其他共用连接的字段。

- 11:10 路由切换、ALB 规则回读及 Connector/J 8.3.0 时区复现见工作区 `.local/ark-cn-root-cause-20261116/REPORT.md`。以报告的实际证据区分生产读回和本地复现。

### 切换后新任务复验

- 新任务的创建、按 ID 查询和时间戳对照见工作区 `.local/ark-sdk-cn-documented-retest-20261116/REPORT.md`。可用分辨率取决于调用的模型和输入组合。遇到 `param=resolution` 的明确 400 时应保留拒绝回执，查证有效组合后再提交；若切换只改变路由，应使用切换后新建的任务来检查时间偏移是否仍发生。
- 如果模型不支持 Ark 解析器的默认分辨率，省略字段会在模型校验时报错。纯文本和带素材输入可用同样的方法定位。抓取实际请求体，沿 `ArkGenerationRequest.command()` 核对默认值，再仅改变 `resolution` 做对照。模型规格按当前配置查证，实测及用户补充口径见同一报告。
- 纯文本分辨率的对照应同时核对终态的 `resolution` 和本地 `ffprobe` 读到的视频流宽高。2026-11-16 的 540p 纯文本回执与成片见同一报告的「540p 纯文生视频」。

## 2026-11-16 双区生成参数合同验收

**Why:** 两协议共用部分生成链路，但 HTTP 校验、默认值和地区开关各自生效。接单返回、异步终态和成片规格都可能有不同结果。

**How to apply:** 分地区冻结测试组织、接口路径与素材归属，从同区同组织素材开始检查。每条用例分别留创建回执、同 ID 的终态和下载实物。对画幅用 ffprobe 验证实物，对指定无音轨的产物查看音轨及音量，对显式水印用正反例抽帧。固定种子由同画幅的单变量对照复核。对 CDN 签名按源码区分签发时间与过期时间，对异步失败只按公开证据归因。

- 双区实际字段矩阵、签名刷新、逐例 Request ID、终态、下载和成片证据见工作区 `.local/generation-parameter-acceptance-20261116/REPORT.md`。依该报告定位可复现的画幅、音轨、大小写和查询时间戳差异，并按现场版本验证。
