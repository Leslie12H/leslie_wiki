---
name: sandeval-quality-sampling-return-map
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, quality, sampling, return, reinspection]
links: [sandeval-two-stage-sampling-scope, sandeval-reinspection-sampling-lineage, sandeval-correction-defer-reinspection, sandeval-qc-reject-threshold-not-enforced]
---

# 空间与 Sand 质检抽样、打回和复验的完整核验入口

**Why:** 逐题不合格、整批退回、报告通过、负责人验收与整包交接是不同事实。两级样本各自生成，历史不合格入样和当前实际应检范围又可能因显式检查豁免分离；把它们合成一个“质检通过率”会误判漏检、整改责任和复验完成。

**How to apply:** 回读当前任务规则和可达源码，先固定完整有效答案份次，再核对本次分配比例与必检集合，沿同关卡连续检查链追溯最近明确有效结论；随后分别验证原抽样计划、实际检查/豁免、正式报告、负责人验收、当前交接和新复验任务。不要把历史业务裁决中的分层配额或累计补差当作现有分配入口已经实现的能力。

## 权威入口

- 抽样参数和下限：`sand-eval/platform/backend/quality/domain/management/{quality_config,batch_allocation,sampling}.py`；实际标准入口：`application/management/{batch_allocation_service,assignment_service}.py`。表单建议值只看 `frontend/src/pages/dispatchMasters/api.ts`，线上实际比例必须读任务绑定配置。
- 逐题与报告结果：`quality/domain/inspection/review_rules.py::calculate_result`，以及内置供应商负责人和质检员使用文档。配置字段的存在不证明它参与报告判定或自动整批退回。
- 退回与复验：`application/resolution/{manual_return_service,leader_resolution_service,direct_return_service}.py`；`application/management/{reinspection_service,reinspection_sampling}.py`。空间链与 Sand 链分别核对，不从 Sand 上游意见的展示推断它一定进入空间复验样本。
- 范围豁免：`application/inspection/inspection_scope_service.py`。检查历史必入样与本轮实际必判的关系，尤其是主动启用供应商通过限定后，原样本中尚未判断项的豁免及新轮次默认范围。
- 待定与整包闭环：`application/resolution/answer_correction_service.py`、`application/management/{submission_service,aggregation_service}.py`，运行自动派回须再看 `quality/infrastructure/runtime.py` 和实际开关。

## 2026-10-15 综合报告指针

[完整报告与 5 张流程图](/Users/leslie/Documents/Playground/output/sandeval-quality-20261015/report.html)；同目录有 SVG、PNG、PDF 和 `sources.json`。报告从 fetch 后固定的 main 树读取，所有代码链接绑定不可变提交；详细 SHA 和证据边界留在报告，不把此页作为部署或线上配置事实。业务仓库保持只读，未运行应用测试或写生产。
