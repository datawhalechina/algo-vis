import { VisualizationStep } from "@/types";

export interface MelFilter {
  center: number;
  centerHz: number;
  values: number[]; // weight for each linear freq bin
}

function hzToMel(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

function melToHz(mel: number): number {
  return 700 * (Math.pow(10, mel / 2595) - 1);
}

function buildMelFilters(nMels: number, nFreqs: number, fmin: number, fmax: number): MelFilter[] {
  const melMin = hzToMel(fmin);
  const melMax = hzToMel(fmax);
  // n_mels + 2 points equally spaced in mel scale
  const melPoints = Array.from({ length: nMels + 2 }, (_, i) =>
    melMin + (i / (nMels + 1)) * (melMax - melMin)
  );
  const hzPoints = melPoints.map(melToHz);

  // Map hz to linear freq bin indices (0..nFreqs-1 covering 0..fmax)
  const hzBinEdges = hzPoints.map((hz) => Math.round((hz / fmax) * (nFreqs - 1)));

  const filters: MelFilter[] = [];
  for (let m = 0; m < nMels; m++) {
    const lo = hzBinEdges[m];
    const center = hzBinEdges[m + 1];
    const hi = hzBinEdges[m + 2];
    const values: number[] = new Array(nFreqs).fill(0);

    for (let k = lo; k <= center; k++) {
      if (center > lo) values[k] = (k - lo) / (center - lo);
    }
    for (let k = center; k <= hi; k++) {
      if (hi > center) values[k] = (hi - k) / (hi - center);
    }

    filters.push({
      center: m,
      centerHz: Number(hzPoints[m + 1].toFixed(0)),
      values,
    });
  }
  return filters;
}

// Synthetic 8×16 spectrogram (8 freq bins, 16 frames)
function buildLinearSpec(seed: number = 42): number[][] {
  const N_FRAMES = 16;
  const N_FREQS = 8;
  const spec: number[][] = [];
  // Use deterministic "random" based on seed
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };

  for (let t = 0; t < N_FRAMES; t++) {
    const row: number[] = [];
    for (let f = 0; f < N_FREQS; f++) {
      // Energy concentrated at low-mid freq, decaying toward high freq
      const baseEnergy = Math.exp(-f * 0.3) * (0.8 + 0.2 * Math.sin((t / N_FRAMES) * Math.PI * 3));
      row.push(Number((baseEnergy * 0.8 + rand() * 0.2).toFixed(4)));
    }
    spec.push(row);
  }
  return spec;
}

function applyMelFilters(linearSpec: number[][], filters: MelFilter[]): number[][] {
  // melSpec[t][m] = sum_k(linearSpec[t][k] * filters[m].values[k])
  const N_FRAMES = linearSpec.length;
  const melSpec: number[][] = [];
  for (let t = 0; t < N_FRAMES; t++) {
    const row: number[] = filters.map((f) =>
      f.values.reduce((acc, w, k) => acc + w * (linearSpec[t][k] ?? 0), 0)
    );
    // normalize
    const max = Math.max(...row, 0.001);
    melSpec.push(row.map((v) => Number((v / max).toFixed(4))));
  }
  return melSpec;
}

export function generateMelSpectrogramSteps(
  nMels: number,
  fmin: number,
  fmax: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const N_FREQS = 8;
  const N_FRAMES = 16;
  const linearSpec = buildLinearSpec(42);
  const melFilters = buildMelFilters(nMels, N_FREQS, fmin, fmax);

  // Step 1: init - show linear spectrogram
  steps.push({
    id: stepId++,
    description: `初始化线性频谱图，${N_FRAMES} 帧 × ${N_FREQS} 线性频率箱（0–${fmax} Hz）。目标：通过梅尔滤波器组将线性频率映射为梅尔刻度的 ${nMels} 个频带。`,
    data: { linearSpec },
    variables: {
      phase: "init",
      linearSpec,
      melFilters: [],
      currentFilter: -1,
      melSpec: [],
      melFreqs: [],
      nMels,
      fmin,
      fmax,
      nFreqs: N_FREQS,
    },
  });

  // Step 2: mel scale conversion
  const melFreqs = Array.from({ length: nMels }, (_, i) => {
    const mel = hzToMel(fmin) + (i / (nMels - 1)) * (hzToMel(fmax) - hzToMel(fmin));
    return Number(melToHz(mel).toFixed(0));
  });

  steps.push({
    id: stepId++,
    description: `计算梅尔刻度频率点：m = 2595 \\cdot \\log_{10}(1 + f/700)。梅尔刻度在低频密集（高分辨率）、高频稀疏（低分辨率），模拟人耳对音高的对数感知。共 ${nMels} 个滤波器中心。`,
    data: { melFreqs },
    variables: {
      phase: "mel_scale",
      linearSpec,
      melFilters: [],
      currentFilter: -1,
      melSpec: [],
      melFreqs,
      nMels,
      fmin,
      fmax,
      nFreqs: N_FREQS,
    },
  });

  // Step 3: filterbank construction - show each filter being added
  steps.push({
    id: stepId++,
    description: `构造梅尔三角滤波器组，共 ${nMels} 个三角滤波器，均匀分布于梅尔刻度 [${hzToMel(fmin).toFixed(0)}, ${hzToMel(fmax).toFixed(0)}] mel。每个三角滤波器对相应频率区间进行加权平均。`,
    data: { melFilters },
    variables: {
      phase: "filterbank",
      linearSpec,
      melFilters,
      currentFilter: -1,
      melSpec: [],
      melFreqs,
      nMels,
      fmin,
      fmax,
      nFreqs: N_FREQS,
    },
  });

  // Step 4: apply filters progressively (show 3 steps)
  const partialMelSpec: number[][] = [];
  const applySteps = [0, Math.floor(N_FRAMES / 2), N_FRAMES - 1];

  for (const frameIdx of applySteps) {
    const rowResult: number[] = melFilters.map((f) =>
      f.values.reduce((acc, w, k) => acc + w * (linearSpec[frameIdx][k] ?? 0), 0)
    );
    const maxV = Math.max(...rowResult, 0.001);
    partialMelSpec.push(rowResult.map((v) => Number((v / maxV).toFixed(4))));

    steps.push({
      id: stepId++,
      description: `对第 ${frameIdx + 1}/${N_FRAMES} 帧应用全部 ${nMels} 个梅尔滤波器：S_{mel}(t, m) = \\sum_{k} H_m(k) \\cdot S_{lin}(t, k)，其中 H_m(k) 为第 m 个三角滤波器的频率响应。`,
      data: { frameIdx, partialMelSpec: partialMelSpec.map((r) => [...r]) },
      variables: {
        phase: "apply",
        linearSpec,
        melFilters,
        currentFilter: frameIdx,
        melSpec: partialMelSpec.map((r) => [...r]),
        melFreqs,
        nMels,
        fmin,
        fmax,
        nFreqs: N_FREQS,
      },
    });
  }

  // Step 5: complete mel spectrogram
  const fullMelSpec = applyMelFilters(linearSpec, melFilters);

  steps.push({
    id: stepId++,
    description: `梅尔频谱图计算完成！输出形状：${N_FRAMES} 帧 × ${nMels} 梅尔频带。相比线性频谱图，低频区域分辨率更高，更符合人耳感知特性，是语音识别和音乐分析的标准输入特征。`,
    data: { melSpec: fullMelSpec, finished: true },
    variables: {
      phase: "complete",
      linearSpec,
      melFilters,
      currentFilter: N_FRAMES - 1,
      melSpec: fullMelSpec,
      melFreqs,
      nMels,
      fmin,
      fmax,
      nFreqs: N_FREQS,
      finished: true,
    },
  });

  return steps;
}

export { hzToMel, melToHz };
