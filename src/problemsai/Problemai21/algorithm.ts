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

/** Swish (SiLU) activation: x * sigmoid(x) */
function swish(x: number): number {
  return round4v(x / (1 + Math.exp(-x)));
}

export function generateSwiGLUSteps(
  seqLen: number,
  dModel: number,
  dFf: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const X = round4(initWeight(seqLen, dModel, 42));

  steps.push({
    id: id++,
    description: `初始化：输入 X [${seqLen}×${dModel}]。SwiGLU FFN 结构：SwiGLU(x) = Swish(xW_gate) ⊙ (xW_up)，W_down 进行最终投影。`,
    data: {},
    variables: { phase: "init", X, seqLen, dModel, dFf },
  });

  // Gate projection
  const W_gate = initWeight(dModel, dFf, 101);
  const gateLinear = round4(matMul(X, W_gate));

  steps.push({
    id: id++,
    description: `门控投影：gate_linear = X × W_gate，形状 [${seqLen}×${dFf}]。这是门控分支，将通过 Swish 激活函数。`,
    data: {},
    variables: { phase: "gate_proj", X, gateLinear, seqLen, dModel, dFf },
  });

  // Up projection
  const W_up = initWeight(dModel, dFf, 202);
  const upLinear = round4(matMul(X, W_up));

  steps.push({
    id: id++,
    description: `值投影：up_linear = X × W_up，形状 [${seqLen}×${dFf}]。这是值分支，将被门控分支调制。`,
    data: {},
    variables: { phase: "up_proj", X, gateLinear, upLinear, seqLen, dModel, dFf },
  });

  // Apply Swish to gate
  const gateSwish = round4(gateLinear.map((row) => row.map((v) => swish(v))));

  // Also compute element-wise comparison
  const swishCurve = Array.from({ length: 21 }, (_, i) => {
    const x = -5 + i * 0.5;
    return { x: round4v(x), relu: round4v(Math.max(0, x)), swish: round4v(swish(x)) };
  });

  steps.push({
    id: id++,
    description: `Swish 激活：gate_swish = Swish(gate_linear) = gate_linear × σ(gate_linear)。Swish 是平滑的 ReLU 变体，负数区域有小梯度，性能优于 ReLU/GELU。`,
    data: {},
    variables: { phase: "swish_gate", gateLinear, gateSwish, upLinear, swishCurve, seqLen, dModel, dFf },
  });

  // Element-wise multiply (gated product)
  const gatedProduct = round4(
    gateSwish.map((row, i) => row.map((v, j) => v * upLinear[i][j]))
  );

  steps.push({
    id: id++,
    description: `门控乘积：gated = Swish(gate) ⊙ up，逐元素相乘。门控值接近 0 的位置会抑制信息传递，门控值接近 1 则让信息通过，实现动态特征选择。`,
    data: {},
    variables: { phase: "gated_product", gateSwish, upLinear, gatedProduct, seqLen, dModel, dFf },
  });

  // Down projection
  const W_down = initWeight(dFf, dModel, 303);
  const output = round4(matMul(gatedProduct, W_down));

  steps.push({
    id: id++,
    description: `输出投影：output = gated × W_down，形状 [${seqLen}×${dModel}]。与标准 FFN 相比，SwiGLU 需要 3 个权重矩阵（W_gate, W_up, W_down），但在 LLaMA 等模型中将 d_ff 设为 8/3 × d_model 保持参数量相当。`,
    data: { finished: true },
    variables: {
      phase: "done", X, gateLinear, upLinear, gateSwish, gatedProduct, output,
      swishCurve, seqLen, dModel, dFf, finished: true,
    },
  });

  return steps;
}
