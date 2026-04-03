import { VisualizationStep } from "@/types";

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

function softmaxMasked(A: number[][]): number[][] {
  return A.map((row) => {
    const max = Math.max(...row.filter((v) => v > -1e8));
    const exps = row.map((v) => (v < -1e8 ? 0 : Math.exp(v - max)));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => (sum === 0 ? 0 : v / sum));
  });
}

function addMatrices(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function layerNorm(X: number[][]): number[][] {
  return X.map((row) => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length;
    const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length;
    const std = Math.sqrt(variance + 1e-5);
    return row.map((v) => (v - mean) / std);
  });
}

function relu(X: number[][]): number[][] {
  return X.map((row) => row.map((v) => Math.max(0, v)));
}

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

export function generateTransformerDecoderSteps(
  decSeqLen: number,
  encSeqLen: number,
  dModel: number,
  numHeads: number,
  dFf: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;
  const dK = Math.floor(dModel / numHeads);

  // Init
  const X_dec = round4(initWeight(decSeqLen, dModel, 77));
  const enc_out = round4(initWeight(encSeqLen, dModel, 88));

  steps.push({
    id: id++,
    description: `初始化：Decoder 输入 X_dec [${decSeqLen}×${dModel}]（已生成的 token 序列），Encoder 输出 enc_out [${encSeqLen}×${dModel}]。`,
    data: {},
    variables: { phase: "init", X_dec, enc_out, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  // Step 1: Masked Self-Attention
  const WQ1 = initWeight(dModel, dModel, 101);
  const WK1 = initWeight(dModel, dModel, 202);
  const WV1 = initWeight(dModel, dModel, 303);
  const Q1 = round4(matMul(X_dec, WQ1).map((r) => r.slice(0, dK)));
  const K1 = round4(matMul(X_dec, WK1).map((r) => r.slice(0, dK)));
  const V1 = round4(matMul(X_dec, WV1).map((r) => r.slice(0, dK)));

  // Causal mask for decoder self-attention
  const causalMask = Array.from({ length: decSeqLen }, (_, i) =>
    Array.from({ length: decSeqLen }, (__, j) => (j <= i ? 0 : -1e9))
  );
  const rawScores1 = round4(matMul(Q1, transpose(K1)));
  const maskedScores = round4(
    rawScores1.map((row, i) => row.map((v, j) => v / Math.sqrt(dK) + causalMask[i][j]))
  );
  const maskedAttnW = round4(softmaxMasked(maskedScores));
  const maskedAttnOut = round4(
    matMul(maskedAttnW, V1).map((row) =>
      Array.from({ length: dModel }, (_, j) => row[j % dK])
    )
  );

  steps.push({
    id: id++,
    description: `掩码自注意力：Q/K/V 均来自 X_dec，应用下三角因果掩码，未来位置分数置为 -∞，保证自回归生成的因果性。`,
    data: {},
    variables: { phase: "masked_self_attn", X_dec, enc_out, Q1, K1, V1, maskedScores, maskedAttnW, maskedAttnOut, causalMask, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  // Add & Norm 1
  const decNorm1 = round4(layerNorm(addMatrices(X_dec, maskedAttnOut)));

  steps.push({
    id: id++,
    description: `Add & Norm₁：X_dec + maskedAttnOut，LayerNorm 稳定训练，输出 decNorm1 [${decSeqLen}×${dModel}]。`,
    data: {},
    variables: { phase: "add_norm_1", X_dec, maskedAttnOut, decNorm1, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  // Step 2: Cross-Attention (Q from decoder, K/V from encoder)
  const WQ2 = initWeight(dModel, dModel, 404);
  const WK2 = initWeight(dModel, dModel, 505);
  const WV2 = initWeight(dModel, dModel, 606);
  const Q2 = round4(matMul(decNorm1, WQ2).map((r) => r.slice(0, dK)));
  const K2 = round4(matMul(enc_out, WK2).map((r) => r.slice(0, dK)));
  const V2 = round4(matMul(enc_out, WV2).map((r) => r.slice(0, dK)));
  const crossScores = round4(
    matMul(Q2, transpose(K2)).map((row) => row.map((v) => v / Math.sqrt(dK)))
  );
  const crossAttnW = round4(softmaxMasked(crossScores));
  const crossAttnOut = round4(
    matMul(crossAttnW, V2).map((row) =>
      Array.from({ length: dModel }, (_, j) => row[j % dK])
    )
  );

  steps.push({
    id: id++,
    description: `交叉注意力：Q 来自 Decoder（decNorm1），K/V 来自 Encoder 输出（enc_out）。Decoder 的每个位置可以关注 Encoder 的全部 ${encSeqLen} 个位置。`,
    data: {},
    variables: { phase: "cross_attn", decNorm1, enc_out, Q2, K2, V2, crossScores, crossAttnW, crossAttnOut, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  // Add & Norm 2
  const decNorm2 = round4(layerNorm(addMatrices(decNorm1, crossAttnOut)));

  steps.push({
    id: id++,
    description: `Add & Norm₂：decNorm1 + crossAttnOut，LayerNorm 后得到 decNorm2，已融合 Encoder 上下文信息。`,
    data: {},
    variables: { phase: "add_norm_2", decNorm1, crossAttnOut, decNorm2, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  // FFN
  const W1 = initWeight(dModel, dFf, 707);
  const ffnHidden = round4(relu(matMul(decNorm2, W1)));

  steps.push({
    id: id++,
    description: `FFN 隐层：decNorm2 × W₁（[${dModel}→${dFf}]）+ ReLU，扩展维度以增加非线性表达能力。`,
    data: {},
    variables: { phase: "ffn_hidden", decNorm2, ffnHidden, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  const W2 = initWeight(dFf, dModel, 808);
  const ffnOut = round4(matMul(ffnHidden, W2));

  steps.push({
    id: id++,
    description: `FFN 输出：ffnHidden × W₂（[${dFf}→${dModel}]），将维度压缩回 d_model = ${dModel}。`,
    data: {},
    variables: { phase: "ffn_out", decNorm2, ffnHidden, ffnOut, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK },
  });

  // Add & Norm 3
  const finalOut = round4(layerNorm(addMatrices(decNorm2, ffnOut)));

  steps.push({
    id: id++,
    description: `Add & Norm₃：decNorm2 + ffnOut，LayerNorm 后得到最终 Decoder 层输出 [${decSeqLen}×${dModel}]，可输入下一层 Decoder 或 Linear + Softmax 生成 token。`,
    data: { finished: true },
    variables: { phase: "done", X_dec, maskedAttnW, crossAttnW, decNorm2, ffnHidden, finalOut, decSeqLen, encSeqLen, dModel, numHeads, dFf, dK, finished: true },
  });

  return steps;
}
