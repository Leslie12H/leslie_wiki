---
name: sandai-api-platform-okhttp-pool-spin-after-load-stop
type: pitfall
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, api-platform, load-test, okhttp, cpu, readiness]
links: [sandai-api-platform-load-generator-readiness, sandai-api-platform-load-test-network-error-attribution]
---

# 停止新增请求后，素材下载仍可触发连接池 CPU 空转

**Why:** 停止客户端发压不等于服务端在途素材准备已退出。2026-11-14 上海现场将部署源码、OkHttp 版本、线程累计 CPU 与素材准备日志对齐后，用纯本地回环的长连接对照复现了纳秒连接池清理间隔造成的 CPU 空转与 TaskRunner 线程膨胀。零空闲连接并不代表池内没有正在使用的连接；短清理间隔仍可在连接使用期间反复调度。客户端超时分类也不证明后端没有收到请求，更不能据此自动重发非幂等生成 POST。

**How to apply:** 分开查看发压器和服务端 CPU、在途输入准备、线程 CPU/栈及最终日志；先核对实际部署依赖和源码，再做相同连接行为的隔离对照。保留原失败证据，分别跟踪连接池修复和独立的素材下载超时，不把全部网络错误归于同一原因。发布后核对滚动完成、实际镜像与目标 class，随后按用户明确的新单档指令验证；不能由修复上线自动触发压测。Pod Ready、离线模拟、接口受理、任务完成和资源恢复分别报告。

## 查证入口

- 官方机制：[OkHttp 4.12.0 RealConnectionPool](https://github.com/square/okhttp/blob/parent-4.12.0/okhttp/src/main/kotlin/okhttp3/internal/connection/RealConnectionPool.kt) 的 cleanup；依赖版本须按当次部署重新确认。
- Zeus 源码：API 工作区 zeus/modules/infra/src/main/java/co/sandai/zeus/infra/http/PublicImageDownloader.java。源码会变化，检查实际部署 SHA；Spring Boot 包内该类可能位于嵌套 infra JAR，不能假设在 BOOT-INF/classes。
- 私有诊断、部署依赖、线程与日志、回环对照、最小修复建议：API 工作区 .local/cn-cpu-after-stop-20261114/REPORT.md。报告是历史取证，不代表当前修复状态。
- 单档双协议入口与验证：API 工作区 .local/cn-oneclick-20261114/README.md、validation.json、checks/ 和 live-readiness.json。配置、当前阻塞、素材及实际测试数以这些现场文件为准，不在知识库复制快照或密钥。

## 双协议与一键入口的验证边界

将比例设为 mixed 不证明固定素材模板能用于两套协议。先核对同一有序素材的原生 v2 与方舟 v3 映射、对应查询路径和发送前计数；创建按计划分流，查询随实际受理与在途状态变化，不要求查询 QPS 也恒定各半。真正启动前验证实际部署与运行锁、重新发现 Pod、等待真实监控窗口；启动意图先持久化，结果未知先读回，不重复启动。入口本地检查通过仍不能替代修复部署、发压器 Ready 或本轮生产准入。
