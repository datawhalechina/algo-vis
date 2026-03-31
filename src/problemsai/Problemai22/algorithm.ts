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

export function generateRMSNormSteps(
  seqLen: number,
  dModel: number,
  eps: number = 1e-5
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const X = round4(initWeight(seqLen, dModel, 42));
  // Learnable gamma parameters (initialized to 1.0)
  const gamma = new Array(dModel).fill(1.0);

  steps.push({
    id: id++,
    description: `初始化：输入 X [${seqLen}×${dModel}]，可学习参数 γ（gamma, 形状 [${dModel}]，初始化为 1）。RMSNorm 无需减去均值，只归除 RMS。`,
    data: {},
    variables: { phase: "init", X, gamma, seqLen, dModel, eps },
  });

  // Compute squared values
  const X_squared = round4(X.map((row) => row.map((v) => v * v)));
  const meanSquares = X.map((row) => {
    const sum = row.reduce((a, b) => a + b * b, 0);
    return round4v(sum / dModel);
  });

  steps.push({
    id: id++,
    description: `计算平方：x² 的形状 [${seqLen}×${dModel}]，然后对每行（每个 token）计算均方根 mean_sq = (1/d)Σxᵢ²。RMSNorm 跳过了 LayerNorm 中的均值计算步骤。`,
    data: {},
    variables: { phase: "squares", X, X_squared, meanSquares, seqLen, dModel, eps },
  });

  // Compute RMS
  const rms = meanSquares.map((ms) => round4v(Math.sqrt(ms + eps)));

  steps.push({
    id: id++,
    description: `计算 RMS：rms = √(mean_sq + ε)，ε = ${eps} 防止除零。每个 token（行）得到一个标量 rms 值，用于归一化该行所有维度。`,
    data: {},
    variables: { phase: "compute_rms", X, X_squared, meanSquares, rms, seqLen, dModel, eps },
  });

  // Normalize
  const normalized = round4(X.map((row, i) => row.map((v) => v / rms[i])));

  steps.push({
    id: id++,
    description: `归一化：x_norm = x / rms。归一化后每行的 RMS 值约为 1，但不保证均值为 0（与 LayerNorm 的关键区别）。计算量比 LayerNorm 少约 20%。`,
    data: {},
    variables: { phase: "normalize", X, rms, normalized, seqLen, dModel, eps },
  });

  // Scale by gamma
  const output = round4(normalized.map((row) => row.map((v, j) => v * gamma[j])));

  // Also compute LayerNorm for comparison
  const ln_mean = X.map((row) => round4v(row.reduce((a, b) => a + b, 0) / dModel));
  const ln_var = X.map((row, i) => round4v(row.reduce((a, b) => a + (b - ln_mean[i]) ** 2, 0) / dModel));
  const ln_std = ln_var.map((v) => round4v(Math.sqrt(v + eps)));
  const ln_output = round4(X.map((row, i) => row.map((v, j) => ((v - ln_mean[i]) / ln_std[i]) * gamma[j])));

  steps.push({
    id: id++,
    description: `缩放：output = γ ⊙ x_norm，恢复表达能力。γ 是可学习参数，训练时可调整各维度的缩放比例。`,
    data: {},
    variables: {
      phase: "scale", X, rms, normalized, gamma, output,
      seqLen, dModel, eps,
    },
  });

  steps.push({
    id: id++,
    description: `RMSNorm 完成！对比 LayerNorm：RMSNorm 省略了均值计算（μ = 0 假设），计算量减少约 20%。LLaMA、Mistral 等现代 LLM 均使用 RMSNorm 替代 LayerNorm。`,
    data: { finished: true },
    variables: {
      phase: "done",
      X, rms, normalized, gamma, output,
      ln_mean, ln_std, ln_output,
      seqLen, dModel, eps, finished: true,
    },
  });

  return steps;
}
