import { VisualizationStep } from "@/types";

const N_FRAMES = 16;
const N_MELS = 8;

// Deterministic pseudo-random
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

function buildMelSpec(): number[][] {
  const rand = seededRand(777);
  const spec: number[][] = [];
  for (let t = 0; t < N_FRAMES; t++) {
    const row: number[] = [];
    for (let m = 0; m < N_MELS; m++) {
      const energy = Math.exp(-m * 0.2) * (0.7 + 0.3 * Math.sin((t / N_FRAMES) * Math.PI * 4 + m));
      row.push(Math.max(0, energy * 0.8 + rand() * 0.2));
    }
    spec.push(row);
  }
  return spec;
}

function applyLog(spec: number[][]): number[][] {
  return spec.map((row) =>
    row.map((v) => Number(Math.log(Math.max(v, 1e-6)).toFixed(5)))
  );
}

// Normalize a matrix to [0,1]
function normalizeSpec(spec: number[][]): number[][] {
  let min = Infinity;
  let max = -Infinity;
  for (const row of spec) for (const v of row) { if (v < min) min = v; if (v > max) max = v; }
  const range = max - min || 1;
  return spec.map((row) => row.map((v) => Number(((v - min) / range).toFixed(4))));
}

// DCT-II for a single frame (1D array of length M)
function dct(frame: number[], nCoeffs: number): number[] {
  const M = frame.length;
  const result: number[] = [];
  for (let n = 1; n <= nCoeffs; n++) {
    let sum = 0;
    for (let m = 1; m <= M; m++) {
      sum += frame[m - 1] * Math.cos((Math.PI * n * (m - 0.5)) / M);
    }
    result.push(Number(sum.toFixed(5)));
  }
  return result;
}

// Compute delta features (first difference)
function computeDelta(matrix: number[][]): number[][] {
  const N = matrix.length;
  const delta: number[][] = [];
  for (let t = 0; t < N; t++) {
    const prev = matrix[Math.max(0, t - 1)];
    const next = matrix[Math.min(N - 1, t + 1)];
    delta.push(prev.map((_, i) => Number(((next[i] - prev[i]) / 2).toFixed(5))));
  }
  return delta;
}

function normalizeRows(matrix: number[][]): number[][] {
  return matrix.map((row) => {
    const max = Math.max(...row.map(Math.abs), 0.001);
    return row.map((v) => Number((v / max).toFixed(4)));
  });
}

export function generateMFCCSteps(nMfcc: number, frameIdx: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const melSpec = buildMelSpec();
  const logMelSpec = applyLog(melSpec);
  const normLogMel = normalizeSpec(logMelSpec);

  // Full MFCC matrix
  const mfccMatrix = logMelSpec.map((row) => dct(row, nMfcc));
  const normMfcc = normalizeRows(mfccMatrix);

  const deltaMatrix = computeDelta(mfccMatrix);
  const normDelta = normalizeRows(deltaMatrix);

  const delta2Matrix = computeDelta(deltaMatrix);
  const normDelta2 = normalizeRows(delta2Matrix);

  const clampedFrame = Math.max(0, Math.min(N_FRAMES - 1, frameIdx));

  // Step 1: init - show mel spectrogram
  steps.push({
    id: stepId++,
    description: `初始化梅尔频谱图，${N_FRAMES} 帧 × ${N_MELS} 梅尔频带。MFCC 的完整处理链：梅尔频谱 → 取对数 → DCT → 保留前 ${nMfcc} 个系数。`,
    data: { melSpec },
    variables: {
      phase: "init",
      melSpec: normalizeSpec(melSpec),
      logMelSpec: [],
      mfccMatrix: [],
      deltaMatrix: [],
      delta2Matrix: [],
      currentFrame: -1,
      nMfcc,
      frameIdx: clampedFrame,
      nMels: N_MELS,
      nFrames: N_FRAMES,
    },
  });

  // Step 2: log compression
  steps.push({
    id: stepId++,
    description: `对梅尔频谱取对数：\\log S_{mel}(t, m)。对数压缩模拟人耳的响度感知（韦伯-费希纳定律），将幅度的大动态范围映射到更均匀的分布，抑制大幅值对特征的主导作用。`,
    data: { logMelSpec },
    variables: {
      phase: "log",
      melSpec: normalizeSpec(melSpec),
      logMelSpec: normLogMel,
      mfccMatrix: [],
      deltaMatrix: [],
      delta2Matrix: [],
      currentFrame: -1,
      nMfcc,
      frameIdx: clampedFrame,
      nMels: N_MELS,
      nFrames: N_FRAMES,
    },
  });

  // Step 3: DCT on select frames
  const dctSteps = [
    clampedFrame,
    Math.floor(N_FRAMES / 3),
    Math.floor((2 * N_FRAMES) / 3),
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3);

  const partialMfcc: (number[] | null)[] = new Array(N_FRAMES).fill(null);

  for (const fi of dctSteps) {
    const coeffs = dct(logMelSpec[fi], nMfcc);
    partialMfcc[fi] = coeffs;

    const partialMatrix: number[][] = partialMfcc.map((row) =>
      row ? row.map((v) => Number((v / (Math.max(...row.map(Math.abs)) || 1)).toFixed(4))) : new Array(nMfcc).fill(0)
    );

    steps.push({
      id: stepId++,
      description: `对第 ${fi + 1} 帧对数梅尔频谱应用 DCT：c_n = \\sum_{m=1}^{M} \\log S_m \\cdot \\cos\\left(\\frac{\\pi n(m-0.5)}{M}\\right)，提取 ${nMfcc} 个倒谱系数。DCT 将相关性高的梅尔系数解相关。`,
      data: { frame: fi, coefficients: coeffs },
      variables: {
        phase: "dct",
        melSpec: normalizeSpec(melSpec),
        logMelSpec: normLogMel,
        mfccMatrix: partialMatrix,
        deltaMatrix: [],
        delta2Matrix: [],
        currentFrame: fi,
        nMfcc,
        frameIdx: clampedFrame,
        nMels: N_MELS,
        nFrames: N_FRAMES,
        currentCoeffs: coeffs,
      },
    });
  }

  // Step 4: full MFCC
  steps.push({
    id: stepId++,
    description: `全部 ${N_FRAMES} 帧 DCT 完成，得到 MFCC 矩阵 C \\in \\mathbb{R}^{T \\times N}（T=${N_FRAMES} 帧，N=${nMfcc} 个系数）。第0个系数 c_0 反映总能量，c_1..c_{N-1} 捕获声道共振特征（共振峰）。`,
    data: { mfccMatrix: normMfcc },
    variables: {
      phase: "mfcc",
      melSpec: normalizeSpec(melSpec),
      logMelSpec: normLogMel,
      mfccMatrix: normMfcc,
      deltaMatrix: [],
      delta2Matrix: [],
      currentFrame: clampedFrame,
      nMfcc,
      frameIdx: clampedFrame,
      nMels: N_MELS,
      nFrames: N_FRAMES,
      currentCoeffs: normMfcc[clampedFrame],
    },
  });

  // Step 5: delta
  steps.push({
    id: stepId++,
    description: `计算 Delta MFCC（一阶差分）：\\Delta c_t = \\frac{c_{t+1} - c_{t-1}}{2}，捕获倒谱系数随时间的变化速度（动态特征）。Delta 特征使模型能感知语音的动态变化，大幅提升识别率。`,
    data: { deltaMatrix: normDelta },
    variables: {
      phase: "delta",
      melSpec: normalizeSpec(melSpec),
      logMelSpec: normLogMel,
      mfccMatrix: normMfcc,
      deltaMatrix: normDelta,
      delta2Matrix: [],
      currentFrame: clampedFrame,
      nMfcc,
      frameIdx: clampedFrame,
      nMels: N_MELS,
      nFrames: N_FRAMES,
    },
  });

  // Step 6: complete with delta-delta
  steps.push({
    id: stepId++,
    description: `计算 Delta-Delta MFCC（二阶差分）：\\Delta^2 c_t = \\Delta c_{t+1} - \\Delta c_{t-1}，捕获加速度信息。标准语音识别特征向量：[${nMfcc} MFCC + ${nMfcc} Delta + ${nMfcc} Delta-Delta] = ${nMfcc * 3} 维，完整描述语音的静态与动态特性。`,
    data: { finished: true },
    variables: {
      phase: "complete",
      melSpec: normalizeSpec(melSpec),
      logMelSpec: normLogMel,
      mfccMatrix: normMfcc,
      deltaMatrix: normDelta,
      delta2Matrix: normDelta2,
      currentFrame: clampedFrame,
      nMfcc,
      frameIdx: clampedFrame,
      nMels: N_MELS,
      nFrames: N_FRAMES,
      finished: true,
    },
  });

  return steps;
}
