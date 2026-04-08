import { VisualizationStep } from "@/types";

export type NoiseLevel = "low" | "medium" | "high";
export type EnhancementMethod = "spectral_subtraction" | "wiener_filter";

const FRAMES = 8;
const FREQ_BINS = 8;

// Clean speech pattern: higher energy in mid-freq bins
const CLEAN_SPEECH_PATTERN: number[][] = [
  [0.1, 0.3, 0.7, 0.9, 0.8, 0.6, 0.2, 0.05],
  [0.1, 0.4, 0.8, 0.95, 0.85, 0.65, 0.25, 0.06],
  [0.1, 0.35, 0.75, 0.92, 0.82, 0.60, 0.22, 0.05],
  [0.05, 0.25, 0.65, 0.88, 0.78, 0.55, 0.18, 0.04],
  [0.1, 0.45, 0.85, 0.98, 0.88, 0.68, 0.28, 0.07],
  [0.1, 0.40, 0.80, 0.93, 0.83, 0.62, 0.24, 0.06],
  [0.08, 0.30, 0.70, 0.90, 0.80, 0.58, 0.20, 0.05],
  [0.02, 0.08, 0.12, 0.10, 0.08, 0.06, 0.04, 0.02], // silence frame
];

const NOISE_LEVELS: Record<NoiseLevel, number> = {
  low: 0.05,     // SNR ~20dB
  medium: 0.18,  // SNR ~10dB
  high: 0.45,    // SNR ~0dB
};

const NOISE_LABEL: Record<NoiseLevel, string> = {
  low: "低噪声（SNR=20dB）",
  medium: "中等噪声（SNR=10dB）",
  high: "高噪声（SNR=0dB）",
};

const ALPHA = 1.5; // over-subtraction factor

function addNoise(clean: number[][], noiseLevel: number): number[][] {
  return clean.map((frame) =>
    frame.map((v) => Math.min(1, Math.max(0, v + noiseLevel * (0.5 + Math.random() * 0.5))))
  );
}

function computeSNR(signal: number[][], noise: number[][]): number {
  let sigPow = 0, noisePow = 0;
  for (let t = 0; t < FRAMES; t++) {
    for (let f = 0; f < FREQ_BINS; f++) {
      sigPow += signal[t][f] ** 2;
      noisePow += noise[t][f] ** 2;
    }
  }
  if (noisePow === 0) return 99;
  return Number((10 * Math.log10(sigPow / noisePow)).toFixed(1));
}

function serializeSpec(spec: number[][]): string {
  return spec.map((row) => row.map((v) => v.toFixed(3)).join(",")).join("|");
}

export function generateSpeechEnhancementSteps(
  noiseLevel: NoiseLevel,
  method: EnhancementMethod
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const noiseAmp = NOISE_LEVELS[noiseLevel];
  const noisySpec = addNoise(CLEAN_SPEECH_PATTERN, noiseAmp);
  const cleanSpec = CLEAN_SPEECH_PATTERN;

  // Noise profile: estimated from frames 6-7 (silence region)
  const noiseProfile = Array(FREQ_BINS).fill(0).map((_, f) => {
    const frame6 = noisySpec[6][f];
    const frame7 = noisySpec[7][f];
    return Number(((frame6 + frame7) / 2).toFixed(3));
  });

  // Step 1: init - show noisy spectrogram
  steps.push({
    id: stepId++,
    description: `输入带噪语音频谱图（${NOISE_LABEL[noiseLevel]}）。频谱图展示了 ${FRAMES} 个时间帧 × ${FREQ_BINS} 个频率通道的能量分布。目标：使用「${
      method === "spectral_subtraction" ? "谱减法" : "维纳滤波"
    }」增强语音质量。`,
    data: { noisySpec, method, noiseLevel },
    variables: {
      phase: "init",
      method,
      noiseLevel,
      noisySpec: serializeSpec(noisySpec),
    },
  });

  // Step 2: noise estimation from silence frames
  steps.push({
    id: stepId++,
    description: `噪声估计：假设第 6-7 帧为静音段（无语音活动），对每个频率通道取平均值，得到噪声功率谱 N̂(f)。此步骤的精度直接影响增强效果。噪声功率谱：[${noiseProfile.join(", ")}]`,
    data: { noiseProfile, noisySpec },
    variables: {
      phase: "noise_est",
      method,
      noiseLevel,
      noisySpec: serializeSpec(noisySpec),
      noiseProfile: noiseProfile.join(","),
    },
  });

  // Step 3: compute mask frame by frame
  const mask: number[][] = [];
  for (let t = 0; t < FRAMES; t++) {
    const maskRow: number[] = [];
    for (let f = 0; f < FREQ_BINS; f++) {
      const Y = noisySpec[t][f];
      const N = noiseProfile[f];
      let m: number;
      if (method === "spectral_subtraction") {
        // |Y_enh(f)| = max(|Y(f)| - α|N(f)|, 0)
        m = Math.max(Y - ALPHA * N, 0) / (Y + 1e-6);
      } else {
        // W(f) = |S|^2 / (|S|^2 + |N|^2)  ≈  max(|Y|-|N|,0)^2 / |Y|^2
        const S_est = Math.max(Y - N, 0);
        m = (S_est * S_est) / (Y * Y + 1e-6);
      }
      maskRow.push(Number(Math.min(1, m).toFixed(3)));
    }
    mask.push(maskRow);

    steps.push({
      id: stepId++,
      description: `计算第 ${t + 1}/${FRAMES} 帧的增强掩蔽：` +
        (method === "spectral_subtraction"
          ? `谱减法：|Y_{enh}(f)| = \\max(|Y(f)| - ${ALPHA}|\\hat{N}(f)|,\\ 0)`
          : `维纳滤波：W(f) = \\frac{|\\hat{S}(f)|^2}{|\\hat{S}(f)|^2 + |\\hat{N}(f)|^2}`),
      data: { mask: mask.slice(), currentFrame: t },
      variables: {
        phase: "mask",
        method,
        noiseLevel,
        noisySpec: serializeSpec(noisySpec),
        noiseProfile: noiseProfile.join(","),
        mask: serializeSpec(mask),
        currentBin: t,
      },
    });
  }

  // Step 4: apply mask to noisy spectrogram
  const enhancedSpec = noisySpec.map((frame, t) =>
    frame.map((v, f) => Number((v * mask[t][f]).toFixed(3)))
  );

  steps.push({
    id: stepId++,
    description: `应用掩蔽，得到增强频谱：Y_{enh}(t, f) = W(t, f) \\cdot Y(t, f)。对每个时频单元逐一相乘，完成频谱抑制。`,
    data: { enhancedSpec, mask },
    variables: {
      phase: "apply",
      method,
      noiseLevel,
      noisySpec: serializeSpec(noisySpec),
      noiseProfile: noiseProfile.join(","),
      mask: serializeSpec(mask),
      enhancedSpec: serializeSpec(enhancedSpec),
    },
  });

  // Step 5: compare before/after
  const noiseMatrix = noisySpec.map((frame, t) =>
    frame.map((v, f) => Number(Math.max(0, v - cleanSpec[t][f]).toFixed(3)))
  );
  const snrBefore = computeSNR(cleanSpec, noiseMatrix);
  const residualNoise = enhancedSpec.map((frame, t) =>
    frame.map((v, f) => Number(Math.max(0, v - cleanSpec[t][f]).toFixed(3)))
  );
  const snrAfter = computeSNR(cleanSpec, residualNoise);

  steps.push({
    id: stepId++,
    description: `对比增强前后频谱。SNR 改善：${snrBefore} dB → ${snrAfter} dB，提升 ${(snrAfter - snrBefore).toFixed(1)} dB。${
      method === "wiener_filter"
        ? "维纳滤波器在最小均方误差（MMSE）准则下最优，对平稳噪声效果尤为显著。"
        : "谱减法实现简单，但过减量 α 过大时会引入「音乐噪声」。"
    }`,
    data: { noisySpec, enhancedSpec, snrBefore, snrAfter },
    variables: {
      phase: "compare",
      method,
      noiseLevel,
      noisySpec: serializeSpec(noisySpec),
      enhancedSpec: serializeSpec(enhancedSpec),
      snrBefore,
      snrAfter,
    },
  });

  // Step 6: complete
  steps.push({
    id: stepId++,
    description: `语音增强完成！方法：${method === "spectral_subtraction" ? "谱减法" : "维纳滤波"}，SNR 从 ${snrBefore} dB 提升到 ${snrAfter} dB（改善 ${(snrAfter - snrBefore).toFixed(1)} dB）。增强后的频谱保留了主要语音成分，有效抑制了背景噪声。`,
    data: { noisySpec, enhancedSpec, snrBefore, snrAfter, finished: true },
    variables: {
      phase: "complete",
      method,
      noiseLevel,
      noisySpec: serializeSpec(noisySpec),
      enhancedSpec: serializeSpec(enhancedSpec),
      snrBefore,
      snrAfter,
      finished: "true",
    },
  });

  return steps;
}
