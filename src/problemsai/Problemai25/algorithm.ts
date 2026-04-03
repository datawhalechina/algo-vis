import { VisualizationStep } from "@/types";

function initWeight(rows: number, cols: number, seed: number): number[][] {
  const W: number[][] = [];
  let x = seed;
  const next = () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return (x / 0xffffffff) * 2 - 1;
  };
  for (let i = 0; i < rows; i++) {
    W.push([]);
    for (let j = 0; j < cols; j++) {
      W[i].push(Number((next() * Math.sqrt(2 / (rows + cols))).toFixed(4)));
    }
  }
  return W;
}

function round4(X: number[][]): number[][] {
  return X.map((r) => r.map((v) => Number(v.toFixed(4))));
}

function round4v(v: number): number {
  return Number(v.toFixed(4));
}

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length, k = A[0].length, n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let p = 0; p < k; p++) C[i][j] += A[i][p] * B[p][j];
  return C;
}

function transpose(A: number[][]): number[][] {
  return Array.from({ length: A[0].length }, (_, i) =>
    Array.from({ length: A.length }, (__, j) => A[j][i])
  );
}

function softmaxRows(A: number[][]): number[][] {
  return A.map((row) => {
    const max = Math.max(...row);
    const exps = row.map((v) => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => v / sum);
  });
}

/**
 * Compute ALiBi slopes for num_heads heads.
 * slope_h = 2^(-8h/num_heads)
 */
function computeALiBiSlopes(numHeads: number): number[] {
  return Array.from({ length: numHeads }, (_, h) =>
    round4v(Math.pow(2, -(8 * (h + 1)) / numHeads))
  );
}

export function generateALiBiSteps(
  seqLen: number,
  numHeads: number,
  dHead: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;
  const scale = 1 / Math.sqrt(dHead);

  const Q = round4(initWeight(seqLen, dHead, 42));
  const K = round4(initWeight(seqLen, dHead, 99));
  const V = round4(initWeight(seqLen, dHead, 77));

  steps.push({
    id: id++,
    description: `初始化：Q、K、V 形状 [${seqLen}×${dHead}]，共 ${numHeads} 个注意力头。ALiBi 无需位置嵌入，而是在注意力分数中直接添加线性位置偏置。`,
    data: {},
    variables: { phase: "init", Q, K, V, seqLen, numHeads, dHead },
  });

  // Compute slopes
  const slopes = computeALiBiSlopes(numHeads);

  steps.push({
    id: id++,
    description: `计算斜率：每个头的斜率 m_h = 2^(-8h/H)，形成等比数列。头 0 斜率最大（${slopes[0]}），头 ${numHeads-1} 斜率最小（${slopes[numHeads-1]}）。斜率控制位置偏置的衰减速度。`,
    data: {},
    variables: { phase: "slopes", Q, K, V, slopes, seqLen, numHeads, dHead },
  });

  // Compute absolute distance matrix
  const distanceMatrix = round4(
    Array.from({ length: seqLen }, (_, i) =>
      Array.from({ length: seqLen }, (__, j) => -(Math.abs(i - j)))
    )
  );

  steps.push({
    id: id++,
    description: `相对距离矩阵：bias[i][j] = -|i-j|，表示位置 i 和 j 之间的距离（取负值，距离越远惩罚越大）。这个矩阵对所有头都相同，只有斜率不同。`,
    data: {},
    variables: { phase: "distance_matrix", distanceMatrix, slopes, seqLen, numHeads, dHead },
  });

  // Compute biases for each head and show first 2
  const biasHead0 = round4(distanceMatrix.map((row) => row.map((v) => v * slopes[0])));
  const biasHead1 = numHeads > 1 ? round4(distanceMatrix.map((row) => row.map((v) => v * slopes[1]))) : undefined;

  steps.push({
    id: id++,
    description: `位置偏置矩阵：bias_h[i][j] = m_h × (-|i-j|)。头 0（m=${slopes[0]}）偏置更大，更关注近邻；头 ${numHeads-1}（m=${slopes[numHeads-1]}）偏置更小，关注范围更广，不同头自然形成不同的位置感知范围。`,
    data: {},
    variables: { phase: "bias_matrix", distanceMatrix, biasHead0, biasHead1, slopes, seqLen, numHeads, dHead },
  });

  // Compute standard attention scores
  const rawScores = round4(
    matMul(Q, transpose(K)).map((row) => row.map((v) => v * scale))
  );

  // Add ALiBi bias (head 0)
  const biasedScores0 = round4(rawScores.map((row, i) => row.map((v, j) => v + biasHead0[i][j])));
  const attnWeightsNoBias = round4(softmaxRows(rawScores));
  const attnWeightsWithBias = round4(softmaxRows(biasedScores0));

  steps.push({
    id: id++,
    description: `添加偏置：biased_scores = QKᵀ/√d_k + bias。与无偏置相比，距离越远的位置权重越小，实现了隐式的相对位置感知，且无需任何位置嵌入参数。`,
    data: {},
    variables: {
      phase: "biased_scores",
      rawScores, biasHead0, biasedScores0,
      attnWeightsNoBias, attnWeightsWithBias,
      slopes, seqLen, numHeads, dHead,
    },
  });

  // Extrapolation demo: show how ALiBi handles longer sequences
  const extraLen = seqLen + 2;
  const extraBias = round4(
    Array.from({ length: extraLen }, (_, i) =>
      Array.from({ length: extraLen }, (__, j) => round4v(-(Math.abs(i - j)) * slopes[0]))
    )
  );

  steps.push({
    id: id++,
    description: `外推能力：ALiBi 的线性偏置公式对任意长度序列都适用，无需重新训练或修改位置编码。训练时 seq_len = ${seqLen}，推理时直接扩展到 ${extraLen} 甚至更长，BLOOM 等模型使用 ALiBi 实现了出色的长度外推能力。`,
    data: { finished: true },
    variables: {
      phase: "done",
      rawScores, biasHead0, biasedScores0,
      attnWeightsNoBias, attnWeightsWithBias,
      extraBias, slopes, seqLen, numHeads, dHead,
      extraLen, finished: true,
    },
  });

  return steps;
}
