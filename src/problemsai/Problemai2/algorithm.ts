import { VisualizationStep } from "@/types";

function softmaxRow(row: number[]): number[] {
  const maxVal = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

function matMulWeightsV(weights: number[][], V: number[][]): number[][] {
  const seqLen = weights.length;
  const dv = V[0]?.length || 0;
  const result: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    result[i] = new Array(dv).fill(0);
    for (let j = 0; j < seqLen; j++) {
      for (let d = 0; d < dv; d++) {
        result[i][d] += weights[i][j] * (V[j]?.[d] ?? 0);
      }
    }
    result[i] = result[i].map((v) => Number(v.toFixed(4)));
  }
  return result;
}

export function generateScaledDotProductAttentionSteps(
  Q: number[][],
  K: number[][],
  V: number[][],
  dk: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const seqLen = Q.length;
  const dq = Q[0]?.length || 0;
  const dv = V[0]?.length || 0;
  const safeDk = Math.max(dk, 1);
  const scale = 1 / Math.sqrt(safeDk);

  if (seqLen === 0 || dq === 0) {
    steps.push({
      id: 0,
      description: "请输入有效的 Q、K、V 矩阵。",
      data: {},
      variables: { phase: "error", finished: true },
    });
    return steps;
  }

  // Step 1: 初始化
  steps.push({
    id: stepId++,
    description: `初始化：Q（${seqLen}×${dq}）、K（${seqLen}×${dq}）、V（${seqLen}×${dv}），d_k = ${safeDk}，缩放因子 1/√d_k = ${scale.toFixed(4)}。公式：Attention(Q,K,V) = softmax(QKᵀ/√d_k)V`,
    data: { Q, K, V, dk: safeDk },
    variables: { phase: "init", Q, K, V, dk: safeDk, scale },
  });

  // Step 2: 逐行计算 QKᵀ 点积
  const scores: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    scores[i] = [];
    for (let j = 0; j < seqLen; j++) {
      let sum = 0;
      for (let d = 0; d < dq; d++) {
        sum += (Q[i]?.[d] ?? 0) * (K[j]?.[d] ?? 0);
      }
      scores[i][j] = Number(sum.toFixed(4));
    }
    steps.push({
      id: stepId++,
      description: `计算 Q[${i}] 与所有 Key 行的点积，得到第 ${i} 行分数：[${scores[i].map((v) => v.toFixed(2)).join(", ")}]`,
      data: { Q, K, V, dk: safeDk, scores: scores.map((r) => [...r]) },
      variables: {
        phase: "dot-product",
        currentQueryIdx: i,
        scores: scores.map((r) => [...r]),
        Q,
        K,
        V,
      },
    });
  }

  // Step 3: 缩放
  const scaledScores = scores.map((row) =>
    row.map((v) => Number((v * scale).toFixed(4)))
  );
  steps.push({
    id: stepId++,
    description: `将所有分数乘以缩放因子 1/√d_k（= ${scale.toFixed(4)}），防止点积过大导致 Softmax 梯度消失。`,
    data: { scaledScores, scores },
    variables: {
      phase: "scale",
      scores,
      scaledScores,
      scale,
      Q,
      K,
      V,
    },
  });

  // Step 4: Softmax
  const attentionWeights = scaledScores.map((row) => softmaxRow(row));
  steps.push({
    id: stepId++,
    description: `对缩放后每行应用 Softmax，得到注意力权重矩阵。每行之和为 1，代表该 Query 对各 Token 的关注程度。`,
    data: { attentionWeights, scaledScores },
    variables: {
      phase: "softmax",
      scaledScores,
      attentionWeights,
      Q,
      K,
      V,
    },
  });

  // Step 5: 加权求和
  const output = matMulWeightsV(attentionWeights, V);
  steps.push({
    id: stepId++,
    description: `用注意力权重对 Value 矩阵加权求和，得到最终输出（${seqLen}×${dv}）。输出中每行都融合了所有 Token 的信息，权重越大贡献越多。`,
    data: { output, attentionWeights },
    variables: {
      phase: "output",
      attentionWeights,
      output,
      Q,
      K,
      V,
    },
  });

  // Step 6: 完成
  steps.push({
    id: stepId++,
    description: `计算完成！Attention(Q,K,V) = softmax(QKᵀ/√d_k)V。注意力机制通过动态权重实现了序列各位置的信息聚合，这是 Transformer 架构的核心。`,
    data: { output, attentionWeights, finished: true },
    variables: {
      phase: "complete",
      scores,
      scaledScores,
      attentionWeights,
      output,
      finished: true,
      Q,
      K,
      V,
    },
  });

  return steps;
}
