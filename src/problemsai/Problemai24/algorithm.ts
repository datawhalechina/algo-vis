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
    const max = Math.max(...row.filter((v) => v > -1e8));
    const exps = row.map((v) => (v < -1e8 ? 0 : Math.exp(v - max)));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => (sum === 0 ? 0 : v / sum));
  });
}

export function generateSlidingWindowSteps(
  seqLen: number,
  windowSize: number,
  dHead: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const Q = round4(initWeight(seqLen, dHead, 42));
  const K = round4(initWeight(seqLen, dHead, 99));
  const V = round4(initWeight(seqLen, dHead, 77));
  const scale = 1 / Math.sqrt(dHead);
  const halfW = Math.floor(windowSize / 2);

  steps.push({
    id: id++,
    description: `初始化：Q、K、V 形状 [${seqLen}×${dHead}]，窗口大小 w = ${windowSize}（每个位置关注前后 ${halfW} 个位置）。标准注意力复杂度 O(N²)，滑动窗口注意力 O(N×w)。`,
    data: {},
    variables: { phase: "init", Q, K, V, seqLen, windowSize, dHead, halfW },
  });

  // Full attention scores for comparison
  const fullScores = round4(
    matMul(Q, transpose(K)).map((row) => row.map((v) => v * scale))
  );
  const fullAttnW = round4(softmaxRows(fullScores));

  steps.push({
    id: id++,
    description: `对比：标准注意力矩阵 [${seqLen}×${seqLen}]，每个位置关注所有位置。计算复杂度 O(${seqLen}²) = O(${seqLen * seqLen})。`,
    data: {},
    variables: { phase: "full_attn", fullScores, fullAttnW, seqLen, windowSize, dHead, halfW },
  });

  // Create window mask
  const windowMask = Array.from({ length: seqLen }, (_, i) =>
    Array.from({ length: seqLen }, (__, j) => {
      const dist = Math.abs(i - j);
      return dist <= halfW ? 0 : -1e9;
    })
  );

  steps.push({
    id: id++,
    description: `滑动窗口掩码：位置 i 只能关注 |i-j| ≤ ${halfW} 的位置，超出窗口的位置分数置为 -∞。掩码矩阵呈带状对角线结构，稀疏度 = ${Math.round((1 - windowSize / seqLen) * 100)}%。`,
    data: {},
    variables: { phase: "window_mask", windowMask, seqLen, windowSize, dHead, halfW },
  });

  // Apply window mask to scores
  const maskedScores = round4(
    fullScores.map((row, i) => row.map((v, j) => v + windowMask[i][j]))
  );
  const windowAttnW = round4(softmaxRows(maskedScores));

  steps.push({
    id: id++,
    description: `掩码注意力权重：应用窗口掩码后，Softmax 只对窗口内位置归一化，窗口外权重为 0。每行非零权重数量为 ${windowSize}（而非 ${seqLen}）。`,
    data: {},
    variables: { phase: "windowed_attn", fullAttnW, windowAttnW, windowMask, seqLen, windowSize, dHead, halfW },
  });

  // Compute windowed attention output
  const windowAttnOut = round4(matMul(windowAttnW, V));

  steps.push({
    id: id++,
    description: `多层感受野扩展：单层窗口注意力感受野 = ${windowSize}。通过堆叠 L 层，感受野 = L × ${windowSize}。${Math.ceil(seqLen / windowSize)} 层后每个位置可以间接关注整个序列，实现全局依赖捕获。`,
    data: {},
    variables: {
      phase: "receptive_field",
      windowAttnW, windowAttnOut, windowMask,
      layer1Range: windowSize, layer2Range: 2 * windowSize, layer3Range: 3 * windowSize,
      seqLen, windowSize, dHead, halfW,
    },
  });

  steps.push({
    id: id++,
    description: `滑动窗口注意力完成！复杂度从 O(N²) = O(${seqLen * seqLen}) 降到 O(N×w) = O(${seqLen * windowSize})，减少 ${Math.round((1 - windowSize / seqLen) * 100)}%。Longformer、Mistral（Sliding Window Attention）等模型使用这种机制处理长序列。`,
    data: { finished: true },
    variables: {
      phase: "done", fullAttnW, windowAttnW, windowAttnOut, windowMask,
      complexityFull: seqLen * seqLen,
      complexityWindow: seqLen * windowSize,
      reductionPct: Math.round((1 - windowSize / seqLen) * 100),
      seqLen, windowSize, dHead, halfW, finished: true,
    },
  });

  return steps;
}
