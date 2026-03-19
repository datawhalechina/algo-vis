import { VisualizationStep } from "@/types";

function matMul(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
  const result: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let l = 0; l < k; l++) {
        result[i][j] += A[i][l] * B[l][j];
      }
    }
  }
  return result.map((row) => row.map((v) => Number(v.toFixed(4))));
}

function transpose(A: number[][]): number[][] {
  const m = A.length;
  const n = A[0].length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => A[j][i])
  );
}

function softmaxRows(A: number[][]): number[][] {
  return A.map((row) => {
    const max = Math.max(...row);
    const exp = row.map((v) => Math.exp(v - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map((v) => Number((v / sum).toFixed(4)));
  });
}

function scaleMatrix(A: number[][], scale: number): number[][] {
  return A.map((row) => row.map((v) => Number((v * scale).toFixed(4))));
}

function sliceCols(A: number[][], start: number, end: number): number[][] {
  return A.map((row) => row.slice(start, end));
}

function hconcat(matrices: number[][][]): number[][] {
  if (matrices.length === 0) return [];
  const seqLen = matrices[0].length;
  return Array.from({ length: seqLen }, (_, i) =>
    matrices.flatMap((m) => m[i])
  );
}

export function generateMultiHeadAttentionSteps(
  Q: number[][],
  K: number[][],
  V: number[][],
  numHeads: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const seqLen = Q.length;
  const dModel = Q[0]?.length ?? 0;

  if (seqLen === 0 || dModel === 0) {
    steps.push({
      id: stepId++,
      description: "请输入有效的 Q/K/V 矩阵。",
      data: {},
      variables: { phase: "error" },
    });
    return steps;
  }

  if (dModel % numHeads !== 0) {
    steps.push({
      id: stepId++,
      description: `d_model (${dModel}) 必须能被 num_heads (${numHeads}) 整除，请调整参数。`,
      data: {},
      variables: { phase: "error" },
    });
    return steps;
  }

  const dK = dModel / numHeads;
  const scale = 1 / Math.sqrt(dK);

  // Step: init
  steps.push({
    id: stepId++,
    description: `初始化：seq_len=${seqLen}, d_model=${dModel}, num_heads=${numHeads}, d_k=${dK}。将 Q/K/V 分为 ${numHeads} 个并行注意力头，每头独立计算维度 ${dK} 的注意力。`,
    data: { Q, K, V },
    variables: {
      phase: "init",
      numHeads,
      dK,
    },
  });

  const headOutputs: number[][][] = [];
  const headWeights: number[][][] = [];

  for (let h = 0; h < numHeads; h++) {
    const start = h * dK;
    const end = start + dK;

    const Qh = sliceCols(Q, start, end);
    const Kh = sliceCols(K, start, end);
    const Vh = sliceCols(V, start, end);

    // Step: split
    steps.push({
      id: stepId++,
      description: `Head ${h + 1}：从 Q/K/V 切分列 [${start}:${end}]，得到 ${seqLen}×${dK} 的子矩阵 Q_${h + 1}, K_${h + 1}, V_${h + 1}。`,
      data: {},
      variables: {
        phase: "split",
        currentHead: h,
        numHeads,
        dK,
        Qh: Qh.map((r) => [...r]),
        Kh: Kh.map((r) => [...r]),
        Vh: Vh.map((r) => [...r]),
        headWeights: headWeights.map((m) => m.map((r) => [...r])),
        headOutputs: headOutputs.map((m) => m.map((r) => [...r])),
      },
    });

    // Compute scaled scores
    const KhT = transpose(Kh);
    const rawScores = matMul(Qh, KhT);
    const scaledScores = scaleMatrix(rawScores, scale);

    // Step: scores
    steps.push({
      id: stepId++,
      description: `Head ${h + 1}：计算缩放点积得分 = Q_${h + 1} × K_${h + 1}^T / √${dK}（缩放因子 ${scale.toFixed(4)}），防止梯度消失。`,
      data: {},
      variables: {
        phase: "scores",
        currentHead: h,
        numHeads,
        dK,
        Qh: Qh.map((r) => [...r]),
        Kh: Kh.map((r) => [...r]),
        Vh: Vh.map((r) => [...r]),
        scaledScores: scaledScores.map((r) => [...r]),
        headWeights: headWeights.map((m) => m.map((r) => [...r])),
        headOutputs: headOutputs.map((m) => m.map((r) => [...r])),
      },
    });

    // Softmax
    const weights = softmaxRows(scaledScores);

    // Step: softmax
    steps.push({
      id: stepId++,
      description: `Head ${h + 1}：对每行得分应用 Softmax，得到注意力权重矩阵（${seqLen}×${seqLen}），每行概率之和为 1。`,
      data: {},
      variables: {
        phase: "softmax",
        currentHead: h,
        numHeads,
        dK,
        Qh: Qh.map((r) => [...r]),
        Kh: Kh.map((r) => [...r]),
        Vh: Vh.map((r) => [...r]),
        scaledScores: scaledScores.map((r) => [...r]),
        weights: weights.map((r) => [...r]),
        headWeights: headWeights.map((m) => m.map((r) => [...r])),
        headOutputs: headOutputs.map((m) => m.map((r) => [...r])),
      },
    });

    // Head output
    const headOut = matMul(weights, Vh);
    headOutputs.push(headOut);
    headWeights.push(weights);

    // Step: head-output
    steps.push({
      id: stepId++,
      description: `Head ${h + 1}：用注意力权重对 V_${h + 1} 加权求和，得到该头的输出（${seqLen}×${dK}）。Head ${h + 1} 计算完成！`,
      data: {},
      variables: {
        phase: "head-output",
        currentHead: h,
        numHeads,
        dK,
        headWeights: headWeights.map((m) => m.map((r) => [...r])),
        headOutputs: headOutputs.map((m) => m.map((r) => [...r])),
      },
    });
  }

  // Concatenate
  const concatOutput = hconcat(headOutputs);

  steps.push({
    id: stepId++,
    description: `将 ${numHeads} 个头的输出沿特征维度拼接，恢复 ${seqLen}×${dModel} 的形状。不同颜色列块代表来自不同头的信息。`,
    data: {},
    variables: {
      phase: "concat",
      numHeads,
      dK,
      concatOutput: concatOutput.map((r) => [...r]),
      headWeights: headWeights.map((m) => m.map((r) => [...r])),
      headOutputs: headOutputs.map((m) => m.map((r) => [...r])),
    },
  });

  steps.push({
    id: stepId++,
    description: `多头注意力计算完成！${numHeads} 个头并行捕获了序列中的不同依赖关系，拼接后可再经线性变换输出。`,
    data: {},
    variables: {
      phase: "complete",
      numHeads,
      dK,
      concatOutput: concatOutput.map((r) => [...r]),
      headWeights: headWeights.map((m) => m.map((r) => [...r])),
      headOutputs: headOutputs.map((m) => m.map((r) => [...r])),
      finished: true,
    },
  });

  return steps;
}
