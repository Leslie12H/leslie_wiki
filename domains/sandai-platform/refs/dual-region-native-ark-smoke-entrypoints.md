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

## 2026-11-16 生成参数偏差取证

**Why** 公开模型枚举、Athena 模型参数校验和推理工作器的尺寸映射各自生效。公开创建与查询只能看到接单和最后交付。音频字段可能在跨服务反序列化时丢失，成功结果也必须检查视频字节。

**How to apply** 先在两区生产 Zeus 日志按测试任务 ID 核对 `SUBMISSION` 和 `EXECUTION`，并从 `task_submitted` 查 Athena 作业 ID。上海生产 SLS 里的 `inference-prod` 查参数校验和素材预处理，`athena` 查对应工作器输入、模型请求尺寸和编码尺寸。沿同一 ID 比较出站字段、下游参数类型、工作器输入和 MP4 音轨。水印按成功交付的原文件逐条抽帧。生产工作器与源码同名实现需要用实际队列、镜像或运行日志对齐。

- 双区画幅改写、提交枚举、音轨开关以及参考媒体时长的根因和逐任务证据见工作区 `.local/generation-parameter-root-cause-20261116/REPORT.md`。按报告区分线上回执、源码复现和尚缺证据的环节。可下载水印样本入口在同一份报告。

### 方舟宽高比回查

- 方舟从宽高推导比例时，先约分再匹配公开枚举。枚举含 `21:9`，同画幅的 1260×540 会约为 `7:3`。回归需同时检查无比例元数据与上游提供等价比例两条分支，保证输出为契约枚举。实际成片与查询字段分别验证。源码和四入口用例见工作区 `.local/generation-parameter-root-cause-20261116/FIX-CHECKLIST.md`。

### 2026-11-16 六种画幅生产复验

- 固定模型、时长、种子和分辨率，在国内与海外的原生 v2、方舟分别创建六种画幅。单独比对实际显示比例、目标像素宽高、方舟比例枚举和方舟实际分辨率。比例正确仍可能输出错档，普通横屏、竖屏也要保留基线。逐任务证据见工作区 `.local/aspect-ratio-retest-20261116-1556/REPORT.md`。
- 多条任务长时间呈 running 时，按请求 ID 对齐 Athena 作业，核对工作器是否收到原始选项及进入模型、编码、交付的哪一阶段。工作器日志中的请求尺寸用于定位，成片和公开终态依次由下载与 GET 回执确认。

### 2026-11-16 默认值、UTC、时长和素材复验

- **Why** SDK 省略字段可能实际发送 null，查询时长的语义也会随版本变化。更换 MySQL 新连接的 UTC 口径可影响新写入，历史任务仍需实测原值。
- **How to apply** 从双区实际部署镜像定位 Zeus #496。分别比较原始 HTTP 省略、显式 null 和 SDK 请求的真实 JSON，沿同任务查工作器入参。UTC 对照同时读取历史异常行和新任务的跨协议创建时间、更新时间与独立状态事件。同一旧任务的前后 GET 及原始 MP4 可复验查询时长变化。复测上传时使用原故障文件的相同哈希，单独增加损坏文件，记录 HTTP、业务码、资产回查与部署策略。证据见工作区 `.local/api-a-b-c-e-retest-20261116-1655/REPORT.md`。
