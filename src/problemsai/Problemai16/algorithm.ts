import { VisualizationStep } from "@/types";

// ── 简化线性代数工具 ──────────────────────────────────────────────────

/** 矩阵乘法：(m×k) × (k×n) → (m×n) */
function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const C: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let p = 0; p < k; p++) C[i][j] += A[i][p] * B[p][j];
  return C;
}

/** 矩阵转置 */
function transpose(A: number[][]): number[][] {
  const m = A.length;
  const n = A[0].length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: m }, (__, j) => A[j][i]));
}

/** 行 softmax */
function softmaxRows(A: number[][]): number[][] {
  return A.map((row) => {
    const max = Math.max(...row);
    const exps = row.map((v) => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => v / sum);
  });
}

/** 对矩阵每个元素乘以标量 */
function scaleMatrix(A: number[][], s: number): number[][] {
  return A.map((row) => row.map((v) => v * s));
}

/** 矩阵元素相加 */
function addMatrices(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

/** LayerNorm：对每个 token（行）做归一化，返回归一化结果 */
function layerNorm(X: number[][]): number[][] {
  return X.map((row) => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length;
    const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length;
    const std = Math.sqrt(variance + 1e-5);
    return row.map((v) => (v - mean) / std);
  });
}

/** ReLU */
function relu(X: number[][]): number[][] {
  return X.map((row) => row.map((v) => Math.max(0, v)));
}

/** 随机初始化权重矩阵（固定 seed 风格，使结果可复现） */
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

// ── 精度截断工具 ──────────────────────────────────────────────────────
function round4(X: number[][]): number[][] {
  return X.map((r) => r.map((v) => Number(v.toFixed(4))));
}

// ── 主生成函数 ────────────────────────────────────────────────────────

export interface TransformerEncoderStepData {
  X?: number[][];
  Q?: number[][];
  K?: number[][];
  V?: number[][];
  scores?: number[][];
  attnWeights?: number[][];
  attnOut?: number[][];
  attnResidual?: number[][];
  ffnHidden?: number[][];
  ffnOut?: number[][];
  finalOut?: number[][];
}

export function generateTransformerEncoderSteps(
  seqLen: number,
  dModel: number,
  numHeads: number,
  dFf: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const dK = Math.floor(dModel / numHeads);

  // ── 初始化输入矩阵 X ─────────────────────────────────────────────
  const X = round4(initWeight(seqLen, dModel, 42));

  steps.push({
    id: id++,
    description: `初始化：输入矩阵 X，形状 [${seqLen}, ${dModel}]，每行代表一个 token 的嵌入向量。`,
    data: {},
    variables: {
      phase: "init",
      X,
      seqLen,
      dModel,
      numHeads,
      dFf,
      dK,
    },
  });

  // ── 计算 Q K V 投影 ──────────────────────────────────────────────
  const WQ = initWeight(dModel, dModel, 101);
  const WK = initWeight(dModel, dModel, 202);
  const WV = initWeight(dModel, dModel, 303);

  const Q = round4(matMul(X, WQ));
  const K = round4(matMul(X, WK));
  const V = round4(matMul(X, WV));

  steps.push({
    id: id++,
    description: `线性投影：X 通过 W_Q、W_K、W_V 三个权重矩阵投影为 Q、K、V，形状均为 [${seqLen}, ${dModel}]。`,
    data: {},
    variables: { phase: "qkv_proj", X, Q, K, V, seqLen, dModel, numHeads, dFf, dK },
  });

  // ── 简化为单头（取第一头的切片演示） ────────────────────────────
  // 仅取前 dK 列做演示，保持可读性
  const Q1 = round4(Q.map((r) => r.slice(0, dK)));
  const K1 = round4(K.map((r) => r.slice(0, dK)));
  const V1 = round4(V.map((r) => r.slice(0, dK)));

  steps.push({
    id: id++,
    description: `多头切分：将 Q/K/V 按列切为 ${numHeads} 个头，每头维度 d_k = ${dK}。此处展示第 1 头（前 ${dK} 列）。`,
    data: {},
    variables: { phase: "head_split", X, Q, K, V, Q1, K1, V1, seqLen, dModel, numHeads, dFf, dK },
  });

  // ── 计算注意力分数 QKᵀ / √d_k ───────────────────────────────────
  const rawScores = round4(matMul(Q1, transpose(K1)));
  const scale = Math.sqrt(dK);
  const scores = round4(scaleMatrix(rawScores, 1 / scale));

  steps.push({
    id: id++,
    description: `注意力分数：计算 QKᵀ / √d_k（√d_k = ${scale.toFixed(2)}），得到原始分数矩阵 [${seqLen}, ${seqLen}]。`,
    data: {},
    variables: {
      phase: "scores",
      X, Q1, K1, V1, scores,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── Softmax → 注意力权重 ─────────────────────────────────────────
  const attnWeights = round4(softmaxRows(scores));

  steps.push({
    id: id++,
    description: `Softmax：对每行进行 Softmax，得到注意力权重矩阵（每行和为 1），用于加权求和 V。`,
    data: {},
    variables: {
      phase: "softmax",
      X, Q1, K1, V1, scores, attnWeights,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── 加权求和得注意力输出（单头） ─────────────────────────────────
  const attnOutHead = round4(matMul(attnWeights, V1));

  // 拼接所有头（简化：将单头输出重复 numHeads 次后裁剪到 dModel 列）
  const attnOut = round4(
    attnOutHead.map((row) => {
      const extended = Array.from({ length: dModel }, (_, j) => row[j % dK]);
      return extended;
    })
  );

  steps.push({
    id: id++,
    description: `注意力输出：attnWeights × V，得到每个 token 的上下文向量，多头拼接后投影回 d_model = ${dModel}。`,
    data: {},
    variables: {
      phase: "attn_output",
      X, attnWeights, attnOut,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── 残差连接 + LayerNorm（注意力子层后） ─────────────────────────
  const attnResidualRaw = addMatrices(X, attnOut);
  const attnResidual = round4(layerNorm(attnResidualRaw));

  steps.push({
    id: id++,
    description: `Add & Norm（注意力子层）：X + attnOut，再经 LayerNorm 归一化，输出维度仍为 [${seqLen}, ${dModel}]。`,
    data: {},
    variables: {
      phase: "attn_residual",
      X, attnOut, attnResidual,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── FFN 第一层：线性 + ReLU ──────────────────────────────────────
  const W1 = initWeight(dModel, dFf, 404);
  const ffnHiddenRaw = relu(matMul(attnResidual, W1));
  const ffnHidden = round4(ffnHiddenRaw);

  steps.push({
    id: id++,
    description: `FFN 第一层：attnResidual × W₁（[${dModel}→${dFf}]）+ ReLU，扩展特征维度到 d_ff = ${dFf}。`,
    data: {},
    variables: {
      phase: "ffn_hidden",
      X, attnResidual, ffnHidden,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── FFN 第二层：线性压缩 ─────────────────────────────────────────
  const W2 = initWeight(dFf, dModel, 505);
  const ffnOutRaw = round4(matMul(ffnHidden, W2));

  steps.push({
    id: id++,
    description: `FFN 第二层：ffnHidden × W₂（[${dFf}→${dModel}]），将特征维度压缩回 d_model = ${dModel}。`,
    data: {},
    variables: {
      phase: "ffn_out",
      X, attnResidual, ffnHidden, ffnOut: ffnOutRaw,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── 残差连接 + LayerNorm（FFN 子层后） ───────────────────────────
  const finalOutRaw = addMatrices(attnResidual, ffnOutRaw);
  const finalOut = round4(layerNorm(finalOutRaw));

  steps.push({
    id: id++,
    description: `Add & Norm（FFN 子层）：attnResidual + ffnOut，再经 LayerNorm。这是 Encoder 层最终输出，可作为下一层输入。`,
    data: {},
    variables: {
      phase: "ffn_residual",
      X, attnResidual, ffnHidden, ffnOut: ffnOutRaw, finalOut,
      seqLen, dModel, numHeads, dFf, dK,
    },
  });

  // ── 完成 ─────────────────────────────────────────────────────────
  steps.push({
    id: id++,
    description: `Encoder 层计算完成！输出矩阵 [${seqLen}, ${dModel}] 与输入形状相同，可堆叠多层或作为解码器的 Key/Value 使用。`,
    data: { finished: true },
    variables: {
      phase: "done",
      X,
      attnWeights,
      attnResidual,
      ffnHidden,
      finalOut,
      finished: true,
      seqLen,
      dModel,
      numHeads,
      dFf,
      dK,
    },
  });

  return steps;
}
