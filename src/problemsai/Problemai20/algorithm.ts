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

export function generateGQASteps(
  seqLen: number,
  numQHeads: number,
  numKVHeads: number,
  dHead: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;
  const numGroups = numQHeads / numKVHeads;
  const dModel = numQHeads * dHead;
  const scale = 1 / Math.sqrt(dHead);

  const X = round4(initWeight(seqLen, dModel, 42));

  steps.push({
    id: id++,
    description: `初始化：输入 X [${seqLen}×${dModel}]。GQA 设定：${numQHeads} 个 Q 头，${numKVHeads} 个 KV 头，每组 ${numGroups} 个 Q 头共享 1 组 KV。`,
    data: {},
    variables: {
      phase: "init", X, seqLen, numQHeads, numKVHeads, dHead, numGroups, dModel,
    },
  });

  // Generate all Q heads
  const Q_heads: number[][][] = [];
  for (let h = 0; h < numQHeads; h++) {
    const WQ = initWeight(dModel, dHead, 100 + h * 37);
    Q_heads.push(round4(matMul(X, WQ)));
  }

  // Generate KV heads (fewer than Q heads)
  const K_heads: number[][][] = [];
  const V_heads: number[][][] = [];
  for (let h = 0; h < numKVHeads; h++) {
    const WK = initWeight(dModel, dHead, 200 + h * 53);
    const WV = initWeight(dModel, dHead, 300 + h * 71);
    K_heads.push(round4(matMul(X, WK)));
    V_heads.push(round4(matMul(X, WV)));
  }

  steps.push({
    id: id++,
    description: `投影：生成 ${numQHeads} 个 Q 头和 ${numKVHeads} 个 KV 头。相比 MHA（${numQHeads} 组 KV），GQA 的 KV 参数减少 ${Math.round((1 - numKVHeads/numQHeads) * 100)}%，KV 缓存也减少同样比例。`,
    data: {},
    variables: {
      phase: "projection",
      Q_head0: Q_heads[0],
      Q_head1: numQHeads > 1 ? Q_heads[1] : undefined,
      K_head0: K_heads[0],
      V_head0: V_heads[0],
      seqLen, numQHeads, numKVHeads, dHead, numGroups,
    },
  });

  // Show grouping
  const groupAssignment = Array.from({ length: numQHeads }, (_, h) =>
    Math.floor(h / numGroups)
  );

  steps.push({
    id: id++,
    description: `分组：Q 头 ${Array.from({length: numQHeads}, (_, h) => `Q${h}`).join(', ')} 被分为 ${numKVHeads} 组，每 ${numGroups} 个 Q 头共享一组 KV 头。这是 MHA 和 MQA 之间的折中方案。`,
    data: {},
    variables: {
      phase: "grouping",
      groupAssignment,
      seqLen, numQHeads, numKVHeads, dHead, numGroups,
    },
  });

  // Compute attention for each group
  const groupAttentions: number[][][][] = [];
  for (let g = 0; g < numKVHeads; g++) {
    const groupAttn: number[][][] = [];
    const K_g = K_heads[g];
    const V_g = V_heads[g];

    for (let q = 0; q < numGroups; q++) {
      const qIdx = g * numGroups + q;
      const Q_h = Q_heads[qIdx];
      const scores = round4(
        matMul(Q_h, transpose(K_g)).map((row) => row.map((v) => v * scale))
      );
      const weights = round4(softmaxRows(scores));
      const output = round4(matMul(weights, V_g));
      groupAttn.push(output);
    }
    groupAttentions.push(groupAttn);
  }

  steps.push({
    id: id++,
    description: `分组注意力：第 0 组：Q 头 ${Array.from({length: numGroups}, (_, q) => q).join('/')} 使用 K₀/V₀；第 1 组：Q 头 ${Array.from({length: numGroups}, (_, q) => numGroups+q).join('/')} 使用 K₁/V₁（以此类推）。每组独立计算注意力。`,
    data: {},
    variables: {
      phase: "grouped_attn",
      attnOut_g0_q0: groupAttentions[0][0],
      attnOut_g0_q1: numGroups > 1 ? groupAttentions[0][1] : undefined,
      K_head0: K_heads[0],
      V_head0: V_heads[0],
      seqLen, numQHeads, numKVHeads, dHead, numGroups,
    },
  });

  // Concat all head outputs
  const concatOut = round4(
    Array.from({ length: seqLen }, (_, i) => {
      const row: number[] = [];
      for (let g = 0; g < numKVHeads; g++) {
        for (let q = 0; q < numGroups; q++) {
          for (let d = 0; d < dHead; d++) {
            row.push(groupAttentions[g][q][i][d]);
          }
        }
      }
      return row;
    })
  );

  steps.push({
    id: id++,
    description: `拼接：将所有 ${numQHeads} 个头的输出拼接，得到 [${seqLen}×${dModel}] 的最终输出。形状与 MHA 完全相同，但 KV 缓存只需 ${numKVHeads}/${numQHeads} = ${(numKVHeads/numQHeads*100).toFixed(0)}% 的空间。`,
    data: { finished: true },
    variables: {
      phase: "done", concatOut,
      seqLen, numQHeads, numKVHeads, dHead, numGroups, dModel,
      kvMemoryRatio: numKVHeads / numQHeads,
      finished: true,
    },
  });

  return steps;
}
