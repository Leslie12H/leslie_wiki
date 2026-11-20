---
name: sandai-playground-account-generation-entrypoints
type: reference
created: 2026-11-19
updated: 2026-11-21
tags: [sandai, api-platform, playground, video, production, testing]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-v2-input-validation-entrypoints]
---

# 开放平台个人账号的在线体验生成与回读

**Why**　2026-11-19 用户授权在国内生产用自己的账号跑视频测评。在线体验具备该账号的控制台会话，完整 API Key 又只在创建时可见。正确区分会话创建链路、公开 Bearer OpenAPI 和模型能力，才能标明实际覆盖的接口和付费归属。

## 查证入口

- 控制台以 [在线体验](https://platform.sandai.cn/app/playground/) 所选账号的 profile 和 `GET /api/v1/platform/models` 为准。以实时目录核对模型参数、可用素材类型和限制。公开 OpenAPI 另查 [国内契约](https://api.sandai.cn/openapi.json)。参数是否可用仍由所选模型的在服配置决定。
- Zeus 的同源控制台路径、归属和查询实现见 [PlatformMediaController](https://github.com/world-sim-dev/zeus/blob/338d36504de0c03654e92f60e6547df35a285816/modules/api/src/main/java/co/sandai/zeus/api/platform/generation/PlatformMediaController.java)，该控制台创建方法使用共享的 `OpenApiGenerationService.createV2` 并以当前组织作为所有者。控制台实测覆盖共享生成路径；外部 Bearer 鉴权需要独立验证。
- 参考素材按已发布前端 [mentions.ts](https://github.com/world-sim-dev/sandai-website/blob/e7bd6949f6628544c15899852945c418b56f767a/apps/platform/src/features/generations/mentions.ts) 的类型内序号映射文件名引用。以上传回执的素材 ID 与生成详情回读的输入类型确认绑定。
- 生产测试的用量、创建回执、终态及素材兼容性证据见工作区 `.local/video-benchmark-cn-20261119/REPORT.md`。本页保留回查路径。个人账号、余额、模型限制和签名媒体 URL 随当次运行记录处理。

**How to apply**　先核对登录账号、地区、余额及在线能力。将附件作为数据解析并保留素材顺序，记录实际参数与测评要求的差异。提交前限制生成次数、用量与截止时间，以创建回执记录任务 ID。遇到结果未知的创建先回读历史，避免重复消费。用 [生成记录](https://platform.sandai.cn/app/generation-history/) 查到终态与产物，再在 [用量明细](https://platform.sandai.cn/app/general/) 按任务 ID 核对金额。

## 切换提交批次

Ego 的本地命令退出后，浏览器内已启动的执行仍可能推进到下一条 POST。2026-11-19 的批次切换因此留下两条不同任务 ID。交接时等待旧执行器确认停止，并核对最新意图、受理回执和在途请求，随后再启动新批次。让提交执行共用一把互斥锁，提交前检查停止信号及整轮上限。按任务 ID 对账时保留同题的每笔实际受理。

## 生产看板漏计在线体验与低流量延迟

**Why**　2026-11-19 国内在线体验已有创建回执，生产看板的公开 v2 创建仍可在同窗显示零。控制台入口和公开 OpenAPI 复用生成服务，但 HTTP 响应在各自入口服务、路由和状态下采集。低流量时，延迟图的固定最小样本门槛也会把已有样本的窗口隐藏。

**How to apply**　核对请求回执及时间后，在对应区域按 `job/service/uri/method/status` 查实际标签，再比较共享受理事件、HTTP 响应量和延迟桶。先验证无样本、少样本及有响应但无错误序列三种窗口，再保存并独立回读主视图与双区对照。生产配置与验收证据沿工作区 [低流量与在线体验](/Users/leslie/Documents/ChatGPT/Apipltform/monitoring/aliyun/production-load-dashboard.md#2026-11-19-低流量与在线体验) 查看。


## 2026-11-19 提示词增强的请求覆盖与作业回读

**Why**　在线体验的模型目录显示默认开启时，脚本显式提交 `enhancePrompt: false` 仍会关闭该次生成的提示词增强。作业结果里的 `enhanced_prompt` 为空时，需要通过请求和前处理回执确认是主动关闭还是执行异常。

**How to apply**　从测评提交原件和 HTTP 回执锁定同一 taskId，核对 `enhancePrompt` 是省略还是显式布尔值。再读取生产模型配置 `config.options.promptEnhancement`、任务详情 `parameters.enablePromptEnhancement` 和 Athena 作业 `pre_processors`，以 `task_submitted` 串起 taskId 与 jobId。当前优先级沿 Zeus `OpenApiGenerationService` 和 `ModelOptionResolver` 查证。本次原请求和受理回执见工作区 `.local/video-benchmark-cn-20261119/`。后续核对以相应环境的模型修订和请求原件为准。


## 2026-11-19 Ark 任务的 PE 默认值变更查证

**Why**　Ark 兼容入口和原生 v2／在线体验共享生成服务，接受的 PE 参数不同。只看 Athena 的增强文本或请求里的模型名称，容易把平台已生效的模型默认值归因给调用方。

**How to apply**　按 taskId 回查两个创建响应的 HTTP 路由、外部模型名和实际 OpenAPI 镜像，用发布回执把镜像绑定到对应源码。核对 Ark 解析器是否允许 PE 字段、传给共享命令的 PE 值以及模型默认值的合并优先级。对照 Zeus 任务保存的开关和 Athena 前处理；记录能定位的生效区间。请求日志只有受理摘要时按已保存的参数投影呈现。精确写入时间、操作者和字段旧值需要配置或数据库审计回执。现场日志见工作区 `.local/org-871466884966341-20261119/boundary-*.json`，发布版本见 [上海生产发布](https://github.com/world-sim-dev/zeus/actions/runs/44293927203)。

核对组织使用了哪些创建入口时，先分页冻结管理台任务 ID，再从组织建立时间起查可关联 orgId 的入口受理和失败日志。用完整创建路由和 taskId 逐笔交叉核对，失败请求可能没有 taskId。待 SLS 追齐快照尾部后，补查缺失的精确 ID。现场入口查询和名单见工作区 `.local/org-871466884966341-20261119/route-*.json`。

## 2026-11-20 Playground 的随机种子核验

**Why**　相同提示词和输出设置重复生成时，需要确认请求里是否指定了 seed，以及服务端实际给该任务分配了什么值。

**How to apply**　从国内生产 Playground 页的静态资源定位部署版本，核对此版本的请求组装和发送字段。沿 Zeus 的请求反序列化与任务组装核对默认值，在同一账号下按已知任务 ID 查询生成详情的 `input.seed`。2026-11-19 的同题双提交可以从工作区 `.local/video-benchmark-cn-20261119/REPORT.md` 中的 H01 两条记录回查。直接 API 的显式取值范围以对外文档为准。 [线上前端提交源码](https://github.com/world-sim-dev/sandai-website/blob/6d8eaddf25adc2bee512d95602897d34e25f793b/apps/platform/src/features/playground/pages/playground-page.tsx#L123-L144) · [Zeus 种子选取](https://github.com/world-sim-dev/zeus/blob/51b97abc89c633a5b4d6ef42678b6afc69a44bc9/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/OpenApiGenerationService.java#L54-L65) · [对外创建契约](https://platform.sand.ai/docs/create-generation/)

## 2026-11-20 品牌短片参考素材与重生成回读

**Why**　产品宣传片的氛围参考和外观依据可能混在一起。多角度商品图也容易让模型误解为一镜中的两台设备。任务受理后再纠正参考素材会产生独立任务和用量记录。

**How to apply**　在品牌产品页或对应配色的商店页选出机背、侧面和展开状态，再目检下载文件。提示词按上传顺序逐张标明外形、配色、构图和光线的用途，混用灵感图时明确它的边界。随请求保存文件哈希、Asset ID、目标时长和显式 PE 值。若需要替换素材，沿新旧任务 ID 保留各自的回读和用量。正式交付时用最终任务的详细输入和成片核对。 [Apple iPhone Duo](https://www.apple.com/iphone-duo/) · [BMW S 1000 RR](https://www.bmwmotorcycles.com/en/models/sport/s1000rr.html) · [生成请求](https://platform.sand.ai/docs/create-generation/)

## 2026-11-21 单图短片的机身稳定性与切点验收

**Why**　商品图与模型道具图提供的是身份和材质依据。参考图减少后，生成仍可能改变视角、屏幕轮廓或轮组方向。完整成片应核对切点两侧和主体结构，任务成功和分辨率只是基础回执。

**How to apply**　刚性产品优先选一张官网图，固定参考姿态和可见侧，分别设计短滑轨、微距和拉远镜头。道具到真物可选同一几何特征做匹配剪辑。屏幕内外切换可用运动遮挡和连续声音做衔接。检查两帧之间的主体位置、运动方向和光线，从提示词、选图和成片分开找偏差。若同时改变素材和镜头方案，把效果写成当次观察，保留单因素归因的未知。工作区成片和精确提示词见 `outputs/magi2-product-shorts-20261120/revision-single-reference/`。 [匹配剪辑方法](https://www.adobe.com/creativecloud/video/post-production/cuts-in-film/match-cut.html)

## 2026-11-21 分镜生成与切点实测

**Why**　按时间写多个镜头仍可能生成近似同机位的长镜头。单张品牌图约束的是主体身份。机位变化、声画透视和道具到实物的动作连续还需要成片处理。

**How to apply**　先按画面信息设计景别和运动，再把不同机位单独生成，给每条片留剪切余量。对照前后镜头的色调和主物体位置选切点。道具轮与实车轮的尺度及轴心可在后期微调，行车镜头相反方向和曝光差过大时补同向或轴线正面的过渡。屏内外复用同一运动素材，以屏幕角点定位画面，进出屏时对照源视频连续帧并让音色由扬声器过渡到环境声。分别核对在线生成输入、实际采用素材、输出切点及编码。现场的提示词、切点与成片见 `outputs/magi2-product-shorts-20261120/redesign-shot-by-shot/`。 [Bruce Block 的画面反差与相似度](https://www.oreilly.com/library/view/the-visual-story/9781317745693/xhtml/Ch02.xhtml) · [Steven Katz 的匹配剪接与跟拍](https://studylib.net/doc/28503985/steven-d.-katz----1991----film-directing-shot-by-shot)
