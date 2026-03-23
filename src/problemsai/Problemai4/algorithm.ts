import { VisualizationStep } from "@/types";

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0]?.length ?? 0;
  const n = B[0]?.length ?? 0;
  const result: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let l = 0; l < k; l++) {
        result[i][j] += (A[i]?.[l] ?? 0) * (B[l]?.[j] ?? 0);
      }
    }
  }
  return result.map((row) => row.map((v) => Number(v.toFixed(4))));
}

function softmaxRow(row: number[]): number[] {
  const maxVal = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateSelfAttentionSteps(
  X: number[][],
  WQ: number[][],
  WK: number[][],
  WV: number[][],
  dk: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const seqLen = X.length;
  const dModel = X[0]?.length ?? 0;
  const safeDk = Math.max(dk, 1);
  const scale = 1 / Math.sqrt(safeDk);

  if (seqLen === 0 || dModel === 0) {
    steps.push({
      id: 0,
      description: "请输入有效的输入矩阵 X。",
      data: {},
      variables: { phase: "error", finished: true },
    });
    return steps;
  }

  // Step 1: init
  steps.push({
    id: stepId++,
    description: `初始化：输入序列 X（${seqLen}×${dModel}），权重矩阵 W_Q、W_K、W_V（${dModel}×${safeDk}）。自注意力中 Q、K、V 均由同一输入 X 通过线性投影得到。`,
    data: { X, WQ, WK, WV },
    variables: { phase: "init", X, WQ, WK, WV, dk: safeDk, scale },
  });

  // Step 2: project Q = X · W_Q
  const Q = matMul(X, WQ);
  steps.push({
    id: stepId++,
    description: `投影 Query 矩阵：Q = X · W_Q，形状 ${seqLen}×${safeDk}。每个 Token 的 Query 向量代表"我在寻找什么"。`,
    data: { X, WQ, Q },
    variables: { phase: "project-q", X, WQ, WK, WV, Q, dk: safeDk, scale },
  });

  // Step 3: project K = X · W_K
  const K = matMul(X, WK);
  steps.push({
    id: stepId++,
    description: `投影 Key 矩阵：K = X · W_K，形状 ${seqLen}×${safeDk}。每个 Token 的 Key 向量代表"我能提供什么信息"。`,
    data: { X, WK, K },
    variables: { phase: "project-k", X, WQ, WK, WV, Q, K, dk: safeDk, scale },
  });

  // Step 4: project V = X · W_V
  const V = matMul(X, WV);
  steps.push({
    id: stepId++,
    description: `投影 Value 矩阵：V = X · W_V，形状 ${seqLen}×${safeDk}。每个 Token 的 Value 向量是实际传递的内容。`,
    data: { X, WV, V },
    variables: { phase: "project-v", X, WQ, WK, WV, Q, K, V, dk: safeDk, scale },
  });

  // Step 5: QKᵀ dot product (row by row)
  const scores: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    scores[i] = [];
    for (let j = 0; j < seqLen; j++) {
      let sum = 0;
      for (let d = 0; d < safeDk; d++) {
        sum += (Q[i]?.[d] ?? 0) * (K[j]?.[d] ?? 0);
      }
      scores[i][j] = Number(sum.toFixed(4));
    }
    steps.push({
      id: stepId++,
      description: `计算 Q[${i}] 与所有 Key 的点积，得到第 ${i} 行分数：[${scores[i].map((v) => v.toFixed(2)).join(", ")}]。`,
      data: { Q, K, V, scores: scores.map((r) => [...r]) },
      variables: {
        phase: "dot-product",
        currentQueryIdx: i,
        scores: scores.map((r) => [...r]),
        X, WQ, WK, WV, Q, K, V, dk: safeDk,
      },
    });
  }

  // Step 6: scale
  const scaledScores = scores.map((row) =>
    row.map((v) => Number((v * scale).toFixed(4)))
  );
  steps.push({
    id: stepId++,
    description: `将所有分数除以 √d_k（= ${Math.sqrt(safeDk).toFixed(4)}），得到缩放分数。防止点积值过大导致 Softmax 梯度消失。`,
    data: { scaledScores, scores },
    variables: {
      phase: "scale",
      scores,
      scaledScores,
      scale,
      X, WQ, WK, WV, Q, K, V,
    },
  });

  // Step 7: softmax
  const attentionWeights = scaledScores.map((row) => softmaxRow(row));
  steps.push({
    id: stepId++,
    description: `对每行应用 Softmax，得到注意力权重矩阵（${seqLen}×${seqLen}）。每行之和为 1，权重越大说明该位置对当前 Query 越重要。`,
    data: { attentionWeights, scaledScores },
    variables: {
      phase: "softmax",
      scaledScores,
      attentionWeights,
      X, WQ, WK, WV, Q, K, V,
    },
  });

  // Step 8: output = attentionWeights · V
  const output = matMul(attentionWeights, V);
  steps.push({
    id: stepId++,
    description: `用注意力权重对 V 加权求和，得到自注意力输出（${seqLen}×${safeDk}）。每个位置的输出都融合了序列所有位置的信息。`,
    data: { output, attentionWeights },
    variables: {
      phase: "output",
      attentionWeights,
      output,
      X, WQ, WK, WV, Q, K, V,
    },
  });

  // Step 9: complete
  steps.push({
    id: stepId++,
    description: `自注意力计算完成！Q=X·W_Q、K=X·W_K、V=X·W_V 均来自同一序列 X。通过动态权重，每个位置能够灵活聚合整个序列的上下文信息，这是 BERT、GPT 等模型的核心。`,
    data: { output, attentionWeights, finished: true },
    variables: {
      phase: "complete",
      scores,
      scaledScores,
      attentionWeights,
      output,
      finished: true,
      X, WQ, WK, WV, Q, K, V,
    },
  });

  return steps;
}
