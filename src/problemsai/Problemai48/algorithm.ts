import { VisualizationStep } from "@/types";

export type SignalType = "sine" | "speech" | "noise";

export interface SpectrogramData {
  phase: string;
  signal: number[];
  frames: number[][];
  currentFrameIdx: number;
  spectrogram: number[][];
  frequencies: number[];
  timeFrames: number[];
  nFft: number;
  signalType: SignalType;
  windowSize: number;
  hopLength: number;
}

function hannWindow(size: number): number[] {
  return Array.from({ length: size }, (_, n) =>
    0.5 * (1 - Math.cos((2 * Math.PI * n) / (size - 1)))
  );
}

function generateSignal(type: SignalType, length: number): number[] {
  const signal: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / length;
    if (type === "sine") {
      signal.push(
        0.8 * Math.sin(2 * Math.PI * 4 * t) +
        0.3 * Math.sin(2 * Math.PI * 8 * t) +
        0.1 * (Math.random() - 0.5)
      );
    } else if (type === "speech") {
      const env = Math.exp(-3 * Math.abs(t - 0.5));
      signal.push(
        env * (
          0.6 * Math.sin(2 * Math.PI * 3 * t) +
          0.4 * Math.sin(2 * Math.PI * 7 * t + 1.2) +
          0.2 * Math.sin(2 * Math.PI * 12 * t + 0.5) +
          0.15 * (Math.random() - 0.5)
        )
      );
    } else {
      // noise
      signal.push((Math.random() - 0.5) * 1.6);
    }
  }
  return signal;
}

function applyWindow(frame: number[], window: number[]): number[] {
  return frame.map((v, i) => v * window[i]);
}

// Simplified DFT magnitude for visualization (first n_freqs bins)
function computeFftMagnitude(frame: number[], nFreqs: number): number[] {
  const n = frame.length;
  const mags: number[] = [];
  for (let k = 0; k < nFreqs; k++) {
    let re = 0;
    let im = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      re += frame[t] * Math.cos(angle);
      im -= frame[t] * Math.sin(angle);
    }
    mags.push(Math.sqrt(re * re + im * im) / n);
  }
  return mags;
}

function normalizeMatrix(mat: number[][]): number[][] {
  let max = 0;
  for (const row of mat) for (const v of row) if (v > max) max = v;
  if (max === 0) return mat;
  return mat.map((row) => row.map((v) => Number((v / max).toFixed(4))));
}

export function generateSpectrogramSteps(
  signalType: SignalType,
  nFft: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const SIGNAL_LEN = 256;
  const WINDOW_SIZE = Math.min(nFft, 64);
  const HOP_LENGTH = WINDOW_SIZE / 2;
  const N_FREQS = 8; // display bins

  const signal = generateSignal(signalType, SIGNAL_LEN);
  const window = hannWindow(WINDOW_SIZE);

  // Step 1: init - show the audio signal
  steps.push({
    id: stepId++,
    description: `初始化音频信号（${signalType === "sine" ? "正弦波" : signalType === "speech" ? "语音模拟" : "噪声"}），共 ${SIGNAL_LEN} 个采样点。短时傅里叶变换（STFT）：X(m,k) = \\sum_{n=0}^{N-1} x(n+mH) \\cdot w(n) \\cdot e^{-j2\\pi kn/N}`,
    data: { signal },
    variables: {
      phase: "init",
      signal,
      frames: [],
      currentFrameIdx: -1,
      spectrogram: [],
      frequencies: [],
      timeFrames: [],
      nFft,
      signalType,
      windowSize: WINDOW_SIZE,
      hopLength: HOP_LENGTH,
    },
  });

  // Step 2: show Hanning window
  steps.push({
    id: stepId++,
    description: `构造汉宁窗（Hanning Window），窗口长度 N=${WINDOW_SIZE}，公式：w(n) = 0.5 \\cdot (1 - \\cos(\\frac{2\\pi n}{N-1}))。加窗能减少频谱泄露，使每帧边界处平滑过渡到零。`,
    data: { window },
    variables: {
      phase: "windowing",
      signal,
      windowValues: window,
      frames: [],
      currentFrameIdx: -1,
      spectrogram: [],
      frequencies: [],
      timeFrames: [],
      nFft,
      signalType,
      windowSize: WINDOW_SIZE,
      hopLength: HOP_LENGTH,
    },
  });

  // Step 3-5: extract frames (show 3 representative frames)
  const numFrames = Math.floor((SIGNAL_LEN - WINDOW_SIZE) / HOP_LENGTH) + 1;
  const frameIndices = [0, Math.floor(numFrames / 3), Math.floor(2 * numFrames / 3)];
  const allFrames: number[][] = [];

  for (let m = 0; m < numFrames; m++) {
    const start = m * HOP_LENGTH;
    const rawFrame = signal.slice(start, start + WINDOW_SIZE);
    const windowed = applyWindow(rawFrame, window);
    allFrames.push(windowed);
  }

  for (const frameIdx of frameIndices) {
    const start = frameIdx * HOP_LENGTH;
    steps.push({
      id: stepId++,
      description: `提取第 ${frameIdx + 1}/${numFrames} 帧：从采样点 n=${start} 开始截取 ${WINDOW_SIZE} 点，应用汉宁窗：x_{windowed}(n) = x(n + ${frameIdx}H) \\cdot w(n)。帧移 H=${HOP_LENGTH}，相邻帧重叠 50%。`,
      data: { frameIdx, frame: allFrames[frameIdx] },
      variables: {
        phase: "windowing",
        signal,
        frames: allFrames.slice(0, frameIdx + 1),
        currentFrameIdx: frameIdx,
        spectrogram: [],
        frequencies: Array.from({ length: N_FREQS }, (_, k) => k),
        timeFrames: Array.from({ length: frameIdx + 1 }, (_, i) => i),
        nFft,
        signalType,
        windowSize: WINDOW_SIZE,
        hopLength: HOP_LENGTH,
      },
    });
  }

  // Step 6-8: FFT on sample frames
  const partialSpec: number[][] = [];

  for (const frameIdx of frameIndices) {
    const mags = computeFftMagnitude(allFrames[frameIdx], N_FREQS);
    partialSpec.push(mags);

    steps.push({
      id: stepId++,
      description: `对第 ${frameIdx + 1} 帧执行 FFT：X(${frameIdx}, k) = \\sum_{n=0}^{N-1} x_{windowed}(n) \\cdot e^{-j2\\pi kn/N}，得到 ${N_FREQS} 个频率箱的幅度谱 |X(${frameIdx}, k)|。`,
      data: { frameIdx, magnitudes: mags },
      variables: {
        phase: "fft",
        signal,
        frames: allFrames.slice(0, frameIdx + 1),
        currentFrameIdx: frameIdx,
        spectrogram: partialSpec.map((r) => [...r]),
        frequencies: Array.from({ length: N_FREQS }, (_, k) => k),
        timeFrames: Array.from({ length: partialSpec.length }, (_, i) => frameIndices[i]),
        nFft,
        signalType,
        windowSize: WINDOW_SIZE,
        hopLength: HOP_LENGTH,
      },
    });
  }

  // Step 9: compute full spectrogram
  const fullSpec: number[][] = allFrames.map((frame) =>
    computeFftMagnitude(frame, N_FREQS)
  );
  const normalizedSpec = normalizeMatrix(fullSpec);

  // subsample to 16 frames for display
  const displayFrames = 16;
  const step = Math.max(1, Math.floor(numFrames / displayFrames));
  const displaySpec: number[][] = [];
  const displayTimeFrames: number[] = [];
  for (let i = 0; i < displayFrames; i++) {
    const idx = Math.min(i * step, numFrames - 1);
    displaySpec.push(normalizedSpec[idx]);
    displayTimeFrames.push(idx);
  }

  steps.push({
    id: stepId++,
    description: `完成全部 ${numFrames} 帧的 FFT 计算，得到完整频谱图矩阵 X \\in \\mathbb{R}^{T \\times F}（T=${numFrames} 帧，F=${N_FREQS} 频率箱）。纵轴为频率，横轴为时间，颜色深浅表示能量大小。`,
    data: { spectrogram: displaySpec, finished: true },
    variables: {
      phase: "spectrogram",
      signal,
      frames: allFrames,
      currentFrameIdx: numFrames - 1,
      spectrogram: displaySpec,
      frequencies: Array.from({ length: N_FREQS }, (_, k) => k),
      timeFrames: displayTimeFrames,
      nFft,
      signalType,
      windowSize: WINDOW_SIZE,
      hopLength: HOP_LENGTH,
      finished: true,
    },
  });

  return steps;
}
