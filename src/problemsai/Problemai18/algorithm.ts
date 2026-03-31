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

export interface FlashAttentionBlockInfo {
  blockRow: number;
  blockCol: number;
  localScores: number[][];
  localMax: number[];
  runningMax: number[];
  runningSumExp: number[];
  outputAccum: number[][];
}

export function generateFlashAttentionSteps(
  seqLen: number,
  dHead: number,
  blockSize: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const Q = round4(initWeight(seqLen, dHead, 42));
  const K = round4(initWeight(seqLen, dHead, 99));
  const V = round4(initWeight(seqLen, dHead, 77));
  const scale = 1 / Math.sqrt(dHead);
  const numBlocks = Math.ceil(seqLen / blockSize);

  steps.push({
    id: id++,
    description: `初始化：Q、K、V 矩阵形状均为 [${seqLen}×${dHead}]，块大小 block_size = ${blockSize}，将分为 ${numBlocks} 个块。标准注意力需要存储 [${seqLen}×${seqLen}] 中间矩阵，Flash Attention 只加载局部块。`,
    data: {},
    variables: { phase: "init", Q, K, V, seqLen, dHead, blockSize, numBlocks },
  });

  // Standard attention for comparison
  const fullScores = round4(
    matMul(Q, transpose(K)).map((row) => row.map((v) => v * scale))
  );

  steps.push({
    id: id++,
    description: `对比：标准注意力需要一次性计算并存储完整的 [${seqLen}×${seqLen}] 分数矩阵，内存为 O(N²)。Flash Attention 通过分块计算避免这个问题。`,
    data: {},
    variables: { phase: "standard_scores", Q, K, V, fullScores, seqLen, dHead, blockSize, numBlocks },
  });

  // Flash attention block computation (simplified for first block row)
  const bsz = Math.min(blockSize, seqLen);

  // Block row 0 processing
  const Q_block0 = Q.slice(0, bsz);
  let runningMax = new Array(bsz).fill(-Infinity);
  let runningSumExp = new Array(bsz).fill(0);
  let outputAccum = Array.from({ length: bsz }, () => new Array(dHead).fill(0));

  const blockInfos: FlashAttentionBlockInfo[] = [];

  for (let jBlock = 0; jBlock < numBlocks; jBlock++) {
    const jStart = jBlock * bsz;
    const jEnd = Math.min(jStart + bsz, seqLen);
    const K_block = K.slice(jStart, jEnd);
    const V_block = V.slice(jStart, jEnd);

    // Local scores for this block pair
    const localScores: number[][] = [];
    for (let i = 0; i < bsz; i++) {
      const row: number[] = [];
      for (let j = 0; j < K_block.length; j++) {
        let dot = 0;
        for (let d = 0; d < dHead; d++) dot += Q_block0[i][d] * K_block[j][d];
        row.push(round4v(dot * scale));
      }
      localScores.push(row);
    }

    // Online softmax update
    const newMax = localScores.map((row) => Math.max(...row));
    const newRunningMax: number[] = [];
    const expLocal: number[][] = [];

    for (let i = 0; i < bsz; i++) {
      const prevMax = runningMax[i] === -Infinity ? newMax[i] : runningMax[i];
      const m_new = Math.max(prevMax, newMax[i]);
      newRunningMax.push(round4v(m_new));

      const expRow = localScores[i].map((v) => round4v(Math.exp(v - m_new)));
      expLocal.push(expRow);

      // Rescale previous accumulations
      const scale_prev = Math.exp(prevMax - m_new);
      runningSumExp[i] = round4v(runningSumExp[i] * scale_prev + expRow.reduce((a, b) => a + b, 0));

      for (let d = 0; d < dHead; d++) {
        outputAccum[i][d] = round4v(outputAccum[i][d] * scale_prev + expRow.reduce((acc, e, j2) => acc + e * V_block[j2 % V_block.length][d], 0));
      }
    }
    runningMax = newRunningMax;

    blockInfos.push({
      blockRow: 0,
      blockCol: jBlock,
      localScores,
      localMax: newMax.map((v) => round4v(v)),
      runningMax: [...runningMax],
      runningSumExp: [...runningSumExp],
      outputAccum: outputAccum.map((r) => r.map((v) => round4v(v))),
    });

    steps.push({
      id: id++,
      description: `块计算 (行块 0, 列块 ${jBlock})：加载 Q[0:${bsz}] 和 K[${jStart}:${jEnd}]，计算局部分数，在线更新最大值（running_max）和分母（running_sum_exp）。`,
      data: {},
      variables: {
        phase: "block_compute",
        Q_block0, K_block, V_block, localScores,
        runningMax: [...runningMax],
        runningSumExp: [...runningSumExp],
        outputAccum: outputAccum.map((r) => [...r]),
        currentBlock: { row: 0, col: jBlock },
        seqLen, dHead, blockSize, numBlocks, bsz,
      },
    });
  }

  // Final normalization
  const flashOutput = round4(
    outputAccum.map((row, i) => row.map((v) => v / runningSumExp[i]))
  );

  steps.push({
    id: id++,
    description: `最终归一化：将累积输出（outputAccum）除以 running_sum_exp，得到块 0 (行 0 到 ${bsz-1}) 的最终注意力输出。对所有行块重复此过程。`,
    data: {},
    variables: {
      phase: "normalize",
      outputAccum: outputAccum.map((r) => [...r]),
      runningSumExp: [...runningSumExp],
      flashOutput,
      seqLen, dHead, blockSize, numBlocks,
    },
  });

  steps.push({
    id: id++,
    description: `Flash Attention 完成！通过分块计算和在线 Softmax，内存从 O(N²) = O(${seqLen*seqLen}) 降低到 O(N×B) = O(${seqLen}×${blockSize})，结果与标准注意力等价。`,
    data: { finished: true },
    variables: {
      phase: "done",
      Q, K, V, fullScores, flashOutput,
      seqLen, dHead, blockSize, numBlocks,
      memoryStandard: seqLen * seqLen,
      memoryFlash: seqLen * blockSize,
      finished: true,
    },
  });

  return steps;
}
