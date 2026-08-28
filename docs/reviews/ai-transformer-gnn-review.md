# AI Transformer / GNN 教学蓝图逐 ID 审查

审查范围：`src/config/aiLessonBlueprints/{transformer,gnn}.ts`，逐项对照 `src/dataai/{transformer,gnn}.ts` 的题目描述、学习目标、输入与输出。判定口径：易读=标题与主题一致；易学=直觉适合初学者；易调试=`debugTip` 可检查明确中间量；公式=语义正确且符合题目契约；步骤=`flow` 连续且可观察。

```mermaid
flowchart LR
    D[原始 data 题目] --> C[核对标题与学习目标]
    B[教学蓝图] --> C
    C --> Q[检查直觉、公式、flow、debugTip]
    Q --> R[逐 ID 判定阻塞级别]
    style D fill:#bbdefb,color:#0d47a1
    style B fill:#bbdefb,color:#0d47a1
    style C fill:#fff3e0,color:#e65100
    style Q fill:#f3e5f5,color:#7b1fa2
    style R fill:#c8e6c9,color:#1a5e20
```

| ID | 易读 | 易学 | 易调试 | 公式 | 步骤 | 结论 | 备注 |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 10092 | PASS | PASS | FAIL | FAIL | PASS | BLOCKER | 总览公式只描述编码器式自注意力+FFN，未表达原题要求的掩码自注意力与交叉注意力；`[B,h,L,L]` 也不适用于一般交叉注意力，其权重应为 `[B,h,L_target,L_source]`。 |
| 10093 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | 正弦编码主线正确且可检查；原题的 `learned` 分支及两类编码对注意力的影响尚未覆盖。 |
| 10094 | PASS | PASS | PASS | PASS | PASS | PASS | Q/K/V 投影、缩放、mask、softmax、加权与多头拼接连续；权重行和、mask 位和形状均可直接检查。 |
| 10095 | PASS | PASS | PASS | PASS | PASS | PASS | 逐位置共享 FFN 的扩维、激活、降维表达准确，中间张量形状明确。 |
| 10096 | PASS | PASS | PASS | PASS | FAIL | BLOCKER | 前三步只完成独立 LN；最后一句“按 Pre-LN 或 Post-LN 接入残差”没有展开两条可观察路径，无法据此区分 `x+Sublayer(LN(x))` 与 `LN(x+Sublayer(x))`。 |
| 10097 | PASS | PASS | PASS | PASS | PASS | PASS | 层间输入输出链连续，逐层形状、范数和相邻层相似度可定位异常。 |
| 10098 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | 因果自注意力到交叉注意力、FFN 的主链正确；原题要求的 Teacher Forcing 与推理差异未进入流程。 |
| 10099 | PASS | PASS | PASS | FAIL | PASS | BLOCKER | 蓝图给出正确的 Noam warmup+inverse-sqrt 公式，但原题学习目标写“余弦衰减”，原题示例又写 inverse-sqrt；课程契约相互冲突，当前公式无法同时满足。 |
| 10100 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | Beam 的扩展、累计、裁剪、EOS 与终选可观察；原题承诺的温度、Top-k 和重复惩罚未覆盖。 |
| 10101 | PASS | PASS | PASS | PASS | PASS | PASS | 损失缩放律与 `C≈6ND` 语义一致，步骤能在固定预算下比较模型受限和数据受限项。 |
| 10102 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | 单层 GCN 的加自环、度归一化、聚合与变换正确；原题的多层信息扩散半径没有显式观察步骤。 |
| 10103 | PASS | PASS | PASS | PASS | FAIL | BLOCKER | 流程从预处理直接跳到“计算损失”，缺少 GCN 前向、预测、反向与参数更新，无法产生原题要求的训练曲线。 |
| 10104 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | 分层采样和由外向内聚合正确；原题的显存估算及推理缓存/复用尚未进入流程。 |
| 10105 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | 单头打分公式正确，flow/debug 已覆盖多头拼接与平均；公式若增加头索引和多头输出式会更完整。 |
| 10106 | PASS | PASS | PASS | PASS | FAIL | BLOCKER | 划分、负采样、编码和解码后直接进入 ROC-AUC，缺少重建损失、反向与更新，不能产出原题声明的 `reconstruction_loss` 训练曲线。 |
| 10107 | PASS | PASS | PASS | PASS | PASS | NON_BLOCKING | `S`、`X'`、`A'` 的形状和变换正确；原题的分配正则、图级分类读出及与其他池化方法的对比未展开。 |
| 10108 | PASS | PASS | FAIL | FAIL | FAIL | BLOCKER | 公式允许 `t_e≤t`，flow 又先用当前事件更新记忆再预测，可能把被预测事件泄漏进表示；debug 只断言“不晚于”查询时刻，同样不能拦截同刻泄漏。应明确先用 `t_e<t_query` 的状态预测，再提交当前事件更新。 |
| 10109 | PASS | PASS | PASS | PASS | PASS | PASS | 异构关系聚合、用户/物品向量、ANN 和 Recall@K 构成连续召回链；暴力 top-k 对照能检查索引中间结果。 |
| 10110 | PASS | FAIL | PASS | PASS | PASS | NON_BLOCKING | “文本 RAG 像按关键词翻资料”会让初学者误以为文本 RAG 只做关键词检索；应改为可包含稀疏、稠密或混合检索。其余图编码、检索、证据回溯步骤成立。 |

## BLOCKERS

- **10092**：补齐解码器/交叉注意力的核心表达，并修正 cross-attention 调试形状。
- **10096**：把 Pre-LN 与 Post-LN 展开为两条明确的残差计算路径。
- **10099**：先统一原始 data 中“余弦衰减”与 “inverse-sqrt” 的课程契约，再确定公式。
- **10103**：在损失与评估之间补齐前向预测、反向传播和参数更新。
- **10106**：补齐重建损失及训练更新步骤。
- **10108**：明确查询时间边界，改为预测后再用当前事件更新记忆，debug 需拒绝同刻泄漏。

## NON_BLOCKING

- **10093、10098、10100**：分别缺少 learned 位置编码、Teacher Forcing 对比，以及温度/Top-k/重复惩罚扩展。
- **10102、10104、10107**：分别缺少多层扩散观察、显存/缓存步骤，以及正则/图分类/池化对比。
- **10105**：多头已在流程和调试中覆盖，但公式仍是单头写法。
- **10110**：文本 RAG 的“关键词检索”类比过窄。

## 第二轮复核（最终代码，2026-08-28）

复核对象为当前最终代码中的 `src/config/aiLessonBlueprints/{transformer,gnn}.ts`、`src/dataai/{transformer,gnn}.ts` 及通用 guided lesson 展示链路。判定维度为：正确性、公式/符号完整、初学者直觉、步骤可执行、调试建议、题目元数据一致。

| ID | 正确性 | 公式/符号 | 初学者直觉 | 步骤可执行 | 调试建议 | 元数据一致 | 结论 | 第二轮备注 |
|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 10092 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **原 BLOCKER 已修复**：编码器、因果自注意力、交叉注意力和 FFN 均入公式，cross-attention shape 正确。 |
| 10093 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 固定/可学习位置编码均进入流程，并安排注意力图对照。 |
| 10094 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 多头投影、缩放、mask、归一化、拼接与形状检查完整。 |
| 10095 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 逐位置共享 FFN 的扩维、激活、降维语义准确。 |
| 10096 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **原 BLOCKER 已修复**：Pre-LN/Post-LN 公式和两条逐步残差路径均已展开。 |
| 10097 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 层间数据流连续，并能通过范数和相似度定位过平滑/爆炸。 |
| 10098 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 因果自注意力、交叉注意力、FFN 及 Teacher Forcing/推理差异均已覆盖。 |
| 10099 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **原 BLOCKER 已修复**：data 统一为 warmup + inverse-sqrt，与 Noam 公式和示例一致。 |
| 10100 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 温度、Top-k、重复惩罚、长度归一化、EOS 与 beam 裁剪形成完整链路。 |
| 10101 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | data 已补计算预算并按 `C≈6ND` 给出可复算结果，不再无依据判定瓶颈类型。 |
| 10102 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 单层规范化聚合和多层多跳扩散均已显式观察。 |
| 10103 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **原 BLOCKER 已修复**：GCN 前向、训练损失、反传更新、验证与测试顺序完整。 |
| 10104 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 分层采样、由外向内聚合、显存统计及推理缓存均覆盖。 |
| 10105 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 公式已补逐头邻域 softmax、头索引和多头输出，拼接/平均分支与调试维度一致。 |
| 10106 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **原 BLOCKER 已修复**：重建损失与编码器反传更新已补齐，留出边防泄漏检查明确。 |
| 10107 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 分配正则、层级池化、图级读出及其他池化对照均已进入流程。 |
| 10108 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **原 BLOCKER 已修复**：严格使用 `t_e<t_q`，先预测、后提交当前事件更新。 |
| 10109 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 异构聚合、ANN 召回、暴力 top-k 对照和冷启动覆盖率可执行。 |
| 10110 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | 文本 RAG 已改为稀疏/稠密/混合检索，图证据可回溯并可消融。 |

### 复核结论

- 原有 BLOCKER `10092、10096、10099、10103、10106、10108` 均已修复；此前 NON_BLOCKING 项也已补齐。
- 19/19 题通过第二轮六维审查。
- KaTeX 独立校验：19 个公式、86 个符号以 `throwOnError` 渲染，全部通过。
- 全量 `npm test` 18/18 通过；`npm run lint` 与 `npx tsc --noEmit` 通过。

### BLOCKERS

**BLOCKERS: 无**

## 第三轮复核（当前工作树，2026-08-28）

| ID | 结论 | 第三轮核验 |
|---:|:---:|---|
| 10101 | PASS | `C\approx6ND` 与示例一致：`6*10^9*2*10^11=1.2*10^21` FLOPs，小于 `1.5*10^21` 预算；文案也不再仅凭 token/参数比武断判定瓶颈。 |
| 10105 | PASS | 每个头的 `alpha_ij` 在固定目标节点 `i` 的邻域 `N(i)` 内对 `j` 做 softmax，分母、头索引、聚合方向与 concat 输出均正确；flow/debug 另覆盖平均分支及逐头和为 1 的检查。 |

- **BLOCKERS：无。** 第二轮关于 10101 预算依据与 10105 单头公式的旧问题保持关闭。
- 验证：示例预算复算为 `1.2e21 <= 1.5e21`，邻域 softmax 数值和为 1；目标公式/符号 KaTeX 校验及相关测试均通过。
