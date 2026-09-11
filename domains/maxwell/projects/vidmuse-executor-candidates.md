---
name: vidmuse-executor-candidates
type: project
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, vidmuse, a2a, git, candidates]
links: [vidmuse-executor-p1, vidmuse-a2a-executor]
---

# VidMuse Git 候选准备入口

独立本地仓库 `~/Downloads/sandai-code/vidmuse-executor`，候选准备入口为 cmd/vidmuse-candidate；范围、复现和验收以 docs/candidate-preparation.md、docs/runtime-version-spike.md、docs/acceptance.md 为准。交付与评审入口为 [vidmuse-executor PR #1](https://github.com/world-sim-dev/vidmuse-executor/pull/1)；分支、合并和部署状态需实时核验。

**Why:** 基准文件清单不能复用每轮候选的 inline 预算。真实 Music Video Plugin 的文本数量超过 32；只有候选准备成功也不能证明 AION 加载过该版本。

**How to apply:** 基准用全部可编辑文件元数据计算资源哈希，按需读取内容；每轮从冻结 base 文件树生成完整候选，提交 parent 保留历史以支持正常快进发布。操作与保护边界见独立仓库文档；不要把本地 Git fixture 的 commit 当成其 GitHub 内容来源 commit。

2026-09-11 核验仍需区分当前部署版 A2A 评测、Git 候选准备、候选真实执行三层。Zeus/AION 普通创建链路的版本承载与实读证明尚需路线选择和范围授权；对应源码指针保存在 runtime-version-spike.md，不在此复制接口定义。


## 独立 Plugin 名称部署路径 — 2026-09-11

**Why:** 按同一 plugin_id 选择任意 commit，与新增不可变 plugin_id 后部署，是两种不同的版本承载方式。不要因为普通 API 没有 revision 参数，就排除通过现有 Plugin 选择能力做候选评测，也不要先把 Zeus/AION 扩展当成必需条件。

**How to apply:** 先核对 Zeus AgentService.buildThreadOptions / normalizeExplicitPlugin / createThread 的 options.plugin_id 透传，以及账号固定 Plugin 覆盖；再核对 AION service/agent_thread.py 和 thread_template.py 的目录校验、模板限制和实际 thread.options。独立候选复制完整 Plugin 到新名称，只调整允许资源，保留原目录与 DEFAULT。

部署必须再读 vidmuse-plugins 的 .github/workflows/deploy.yml：2026-09-11 核验版本 277c1c699d8da69a4529799bf6d5416a5b3efc4f；关注环境共用目录中的 checkout / reset / pull，而不是把 workflow_dispatch 理解成追加一个 Plugin。多个候选并存需部署包含所有保留候选的树；分支隔离本身不能保证部署隔离。批次内冻结共享依赖，并通过现有运行证据核对绑定的 Plugin 与文件内容。Runner 重建与共享依赖解析继续查 Workflow Catalog、Thread 与 Plugin 指针页。

以上是源码核验和方案修正，未部署或实测线上账号。方案 B 的逐线程 commit 扩展可在要求同名多版本、跨发布重建仍固定版本时再评估；不能把源码支持写成已完成真实候选闭环。


## DEV 发布、执行账号与公共依赖 — 2026-09-11

用户明确要求候选发布仅限 DEV，且不影响其他在用分支的运行版本。后续方案与实现都应保留此约束；本轮仅核验和设计，未授权或执行部署。

**Why:** Git 源分支隔离、部署文件保留和运行依赖固定是不同边界。候选追加发布也会被后续普通 checkout 覆盖，除非所有写同一 DEV 目录的发布入口统一保留在用候选。发布器应在可信配置中固定 DEV 目标，并由部署凭证权限约束，不能只靠请求中的 environment 字段。

**How to apply:** 核对 Plugin deploy workflow、AION manager/runner_wrapper/kubernets.py 与 revisioned_skills_cache/cache.py。设计候选只新增独立 Plugin 目录及独立依赖版本，拒绝覆盖、删除或更改 DEFAULT/latest；保持部署 Git commit 可归档，不能只复制未提交文件。记录 source commit、deployment commit 与候选资源 hash，不把两种 commit 冒充同一版本。若普通发布无法统一管理，需独立运行目录和真实 Manager/Runner 路由，不能承诺零影响。

- 身份核验入口：Zeus api/agent/AgentThreadController.createThread、api/user/service/UserApiService.getCurrentUser、domain/agent/service/AgentService.buildThreadOptions。产品创建取认证上下文的用户，权限/固定 Plugin 选择属于账号；更换同账号 Token 不形成新的运行身份。Executor HTTP 的 A2A Bearer 与调用 Zeus 的产品凭据分开，未来账号池应固定每次执行的账号绑定，重试或换 Token 不静默换账号。Admin 服务 JWT 是另一种凭据，不推断其可调用普通 Zeus 产品接口。
- 公共依赖核验入口：AION revisioned_skills_cache/cache.py 的 _materialize_skills / _materialize_common_workflows，以及 manager/service/agent_thread.py 的 _resolve_common_skill_ref / _materialize_thread_skills。先解析 latest，再将候选引用固定到具体版本及内容 hash。公共变更新增私有版本，仅改候选 config.skill_refs / workflow_refs；不覆盖已有版本或移动全局 latest。公共 Skill 在本地 Skill 之后复制，会覆盖同名本地 Skill；改用本地副本时必须处理冲突引用。
- 当前 Executor 范围核验：internal/app/run.go 的独立凭据配置、execution/infrastructure/zeus/client.go 的固定 Plugin，以及 candidate/manifest.go 的路径限制。受控 config 引用修改、公共目录和 Workflow 代码目前不在候选白名单，实施前需明确扩展合同与验证；平台 Python 包、Runner 镜像、模型服务配置属于运行环境变更，不能包装成普通 Plugin 文本候选。

源码核验使用 Zeus 9b34cc757cfa44381a6b5a61486c4457b57014d6 与 AION ea4596d554dbc1c886198b5e9941719339cff171；对照 AION main 739d7b3dd3b02d4920bb4a419e744939a446eca4 的差异，上述依赖解析文件未变。运行环境配置与真实账号验收仍需单独验证。
