# 全项目可视化补全任务板

| 卡片 | 范围 | Owner | 状态 | 合并门禁 |
| --- | --- | --- | --- | --- |
| CORE-001 | 教学蓝图协议、共享渲染器、注册表 | root | Done | 单测、类型、构建 |
| AI-CNN | 10072-10081 | ai-cnn | Done | 逐 ID 内容审查 |
| AI-RNN | 10082-10091 | ai-rnn | Done | 逐 ID 内容审查 |
| AI-TRANSFORMER | 10092-10101 | ai-transformer | Done | 逐 ID 内容审查 |
| AI-GNN | 10102-10110 | ai-gnn | Done | 逐 ID 内容审查 |
| AI-GENERATIVE | 10111-10134 | ai-generative | Done | 逐 ID 内容审查 |
| CUDA | 102-702（除 101） | cuda | Done | 逐 ID 内容审查 |
| CONCEPT-DS-OS | 40001-40012 | concept-ds-os | Done | 逐 ID 内容审查 |
| CONCEPT-NET-DB | 40013-40024 | concept-net-db | Done | 逐 ID 内容审查 |
| CONCEPT-COMP-ARCH | 40025-40036 | concept-compiler-arch | Done | 逐 ID 内容审查 |
| REVIEW-AI | AI 63 题逐项审查 | reviewer-ai | Done | 无阻断项 |
| REVIEW-SYSTEMS | CUDA 21 + 概念 36 逐项审查 | reviewer-systems | Done | 无阻断项 |
| E2E-001 | 桌面/移动交互与截图验收 | root | Done | 关键流程全通过 |

所有内容代理只修改自己的分片；共享文件由主代理统一集成。审查报告写入 `docs/reviews/`，每个 ID 单独一行，保留修改建议和复核结论。

最终验收：346 个学习条目均有可访问页面；新增的 120 个 guided lesson 与 36 个 DRL lesson 均为每个 `flow[i]` 生成独立步骤。重点 DRL 移动端回归逐一点击 39 个流程关节，全部落到 `step = 3 + i`，KaTeX 错误数和页面级横向溢出均为 0。
