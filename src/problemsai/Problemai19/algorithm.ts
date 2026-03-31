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
 * Apply RoPE rotation to a single vector at position m.
 * d must be even. Pairs (x_{2i}, x_{2i+1}) are rotated by θ_i * m.
 */
function applyRoPE(vec: number[], m: number, thetas: number[]): number[] {
  const result = [...vec];
  const halfD = Math.floor(vec.length / 2);
  for (let i = 0; i < halfD; i++) {
    const theta = thetas[i] * m;
    const x0 = vec[2 * i];
    const x1 = vec[2 * i + 1];
    result[2 * i] = round4v(x0 * Math.cos(theta) - x1 * Math.sin(theta));
    result[2 * i + 1] = round4v(x0 * Math.sin(theta) + x1 * Math.cos(theta));
  }
  return result;
}

export function generateRoPESteps(
  seqLen: number,
  dHead: number,
  base: number = 10000
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const Q = round4(initWeight(seqLen, dHead, 42));
  const K = round4(initWeight(seqLen, dHead, 99));

  steps.push({
    id: id++,
    description: `初始化：Q 和 K 矩阵形状为 [${seqLen}×${dHead}]，尚未添加位置信息。RoPE 将通过旋转变换将相对位置信息编码进 Q/K 向量。`,
    data: {},
    variables: { phase: "init", Q, K, seqLen, dHead, base },
  });

  // Compute rotation frequencies
  const halfD = Math.floor(dHead / 2);
  const thetas = Array.from({ length: halfD }, (_, i) =>
    round4v(1.0 / Math.pow(base, (2 * i) / dHead))
  );

  // Angle matrix: angles[pos][i] = thetas[i] * pos
  const angleMatrix = Array.from({ length: seqLen }, (_, m) =>
    thetas.map((theta) => round4v(theta * m))
  );

  // Cos/Sin matrices
  const cosMatrix = round4(angleMatrix.map((row) => row.map((v) => Math.cos(v))));
  const sinMatrix = round4(angleMatrix.map((row) => row.map((v) => Math.sin(v))));

  steps.push({
    id: id++,
    description: `计算旋转频率：θ_i = 1 / (${base}^(2i/d))，共 ${halfD} 个频率，从高频到低频覆盖不同粒度的位置信息。`,
    data: {},
    variables: { phase: "compute_freqs", Q, K, thetas, angleMatrix, cosMatrix, sinMatrix, seqLen, dHead, base, halfD },
  });

  steps.push({
    id: id++,
    description: `位置角度矩阵：angle[m][i] = θ_i × m，每个位置 m 对应一组独特的旋转角度。cos/sin 值将用于旋转 Q 和 K 的各维度对。`,
    data: {},
    variables: { phase: "angles", Q, K, thetas, angleMatrix, cosMatrix, sinMatrix, seqLen, dHead, base, halfD },
  });

  // Apply RoPE to Q
  const Q_rotated = round4(Q.map((vec, m) => applyRoPE(vec, m, thetas)));

  steps.push({
    id: id++,
    description: `旋转 Q：对 Q 的每个 token 向量，按位置 m 施加旋转变换。每对维度 (q_{2i}, q_{2i+1}) 绕原点旋转 θ_i·m 弧度。`,
    data: {},
    variables: { phase: "rotate_q", Q, Q_rotated, K, thetas, cosMatrix, sinMatrix, seqLen, dHead, base, halfD },
  });

  // Apply RoPE to K
  const K_rotated = round4(K.map((vec, m) => applyRoPE(vec, m, thetas)));

  steps.push({
    id: id++,
    description: `旋转 K：对 K 的每个 token 向量施加同样的旋转变换。关键性质：旋转 Q 和 K 后的点积只与位置差 (m-n) 有关，自然编码了相对位置！`,
    data: {},
    variables: { phase: "rotate_k", Q_rotated, K_rotated, thetas, cosMatrix, sinMatrix, seqLen, dHead, base, halfD },
  });

  // Compute attention with rotated Q/K
  const scale = 1 / Math.sqrt(dHead);
  const attnScores = round4(
    matMul(Q_rotated, transpose(K_rotated)).map((row) =>
      row.map((v) => v * scale)
    )
  );
  const attnWeights = round4(softmaxRows(attnScores));

  steps.push({
    id: id++,
    description: `计算注意力：使用旋转后的 Q_rot 和 K_rot 计算注意力分数。Q_rot[m]·K_rot[n] 的结果隐含了相对位置 (m-n) 的信息，无需显式位置嵌入。`,
    data: {},
    variables: { phase: "attn", Q_rotated, K_rotated, attnScores, attnWeights, seqLen, dHead, base, halfD },
  });

  steps.push({
    id: id++,
    description: `RoPE 完成！相对位置性质：q_m · k_n 只依赖于 (m-n)，使得模型对序列长度的泛化能力更强，LLaMA、Mistral、GPT-NeoX 等主流模型均采用 RoPE。`,
    data: { finished: true },
    variables: {
      phase: "done",
      Q, K, Q_rotated, K_rotated, attnWeights, thetas, cosMatrix, sinMatrix,
      seqLen, dHead, base, halfD, finished: true,
    },
  });

  return steps;
}
