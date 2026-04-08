import { VisualizationStep } from "@/types";

export interface VADFrame {
  idx: number;
  energy: number;
  zcr: number;
  isSpeech: boolean;
}

export interface VADInput {
  signal_pattern: string;
  energy_threshold: number;
  zcr_threshold: number;
}

// Simulate audio frames based on signal pattern
function generateFrames(
  pattern: string,
  energyThreshold: number,
  _zcrThreshold: number
): VADFrame[] {
  const frames: VADFrame[] = [];
  const N = 20;

  // Pattern: "speech_silence" | "noisy" | "long_silence"
  const isSpeechSegment = (i: number): boolean => {
    if (pattern === "noisy") {
      // More frames detected as speech with lower threshold effect
      return i % 5 !== 0;
    } else if (pattern === "long_silence") {
      // Only first 5 frames are speech
      return i < 5;
    } else {
      // Default: alternating speech/silence blocks
      const block = Math.floor(i / 4);
      return block % 2 === 0;
    }
  };

  for (let i = 0; i < N; i++) {
    const speechSegment = isSpeechSegment(i);

    // Simulate energy: speech has higher energy
    let baseEnergy: number;
    let baseZcr: number;

    if (speechSegment) {
      // Speech: high energy (0.4-0.9), moderate-high ZCR (0.15-0.45)
      baseEnergy = 0.45 + (i * 7 + 13) % 45 * 0.01;
      baseZcr = 0.18 + (i * 11 + 7) % 27 * 0.01;
    } else {
      // Silence: low energy (0.02-0.15), low ZCR (0.02-0.12)
      baseEnergy = 0.03 + (i * 3 + 5) % 13 * 0.01;
      baseZcr = 0.03 + (i * 5 + 3) % 10 * 0.01;
    }

    if (pattern === "noisy") {
      // Add noise: bump silence energy a bit
      if (!speechSegment) baseEnergy += 0.08;
    }

    const energy = Math.min(0.99, Math.max(0.01, baseEnergy));
    const zcr = Math.min(0.99, Math.max(0.01, baseZcr));
    const decision = energy > energyThreshold && zcr > 0.05 && zcr < 0.6;

    frames.push({ idx: i, energy, zcr, isSpeech: decision });
  }

  return frames;
}

function getVoiceSegments(frames: VADFrame[]): Array<{ start: number; end: number }> {
  const segs: Array<{ start: number; end: number }> = [];
  let inSpeech = false;
  let segStart = 0;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].isSpeech && !inSpeech) {
      inSpeech = true;
      segStart = i;
    } else if (!frames[i].isSpeech && inSpeech) {
      segs.push({ start: segStart, end: i - 1 });
      inSpeech = false;
    }
  }
  if (inSpeech) segs.push({ start: segStart, end: frames.length - 1 });
  return segs;
}

export function generateVADSteps(input: VADInput): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const { signal_pattern, energy_threshold, zcr_threshold } = input;
  const allFrames = generateFrames(signal_pattern, energy_threshold, zcr_threshold);

  // Step 1: init
  steps.push({
    id: stepId++,
    description: `初始化 VAD（语音活动检测）系统。输入音频被分为 ${allFrames.length} 帧，每帧包含若干采样点。信号模式：${signal_pattern}，能量阈值 θ_E = ${energy_threshold}，过零率阈值 θ_ZCR = ${zcr_threshold}。`,
    data: {},
    variables: {
      phase: "init",
      frames: [],
      currentFrameIdx: -1,
      energyThreshold: energy_threshold,
      zcrThreshold: zcr_threshold,
      vadLabels: [],
      voiceSegments: [],
    },
  });

  // Step 2: energy_calc - show energy for all frames
  const energyFrames = allFrames.map((f) => ({ ...f, zcr: 0, isSpeech: false }));
  steps.push({
    id: stepId++,
    description: `计算每帧短时能量（STE）：E_n = \\frac{1}{N}\\sum_{k=0}^{N-1} x^2(k)。语音帧能量明显高于静音帧。当前显示各帧能量值，阈值线 θ_E = ${energy_threshold}。`,
    data: {},
    variables: {
      phase: "energy_calc",
      frames: JSON.stringify(energyFrames),
      currentFrameIdx: allFrames.length - 1,
      energyThreshold: energy_threshold,
      zcrThreshold: zcr_threshold,
      vadLabels: [],
      voiceSegments: [],
    },
  });

  // Step 3: zcr_calc - show ZCR for all frames
  const zcrFrames = allFrames.map((f) => ({ ...f, isSpeech: false }));
  steps.push({
    id: stepId++,
    description: `计算每帧过零率（ZCR）：ZCR_n = \\frac{1}{2N}\\sum_{k=1}^{N-1}|\\text{sgn}(x_k) - \\text{sgn}(x_{k-1})|。清音（如 /s/、/f/）过零率较高，浊音和静音较低。`,
    data: {},
    variables: {
      phase: "zcr_calc",
      frames: JSON.stringify(zcrFrames),
      currentFrameIdx: allFrames.length - 1,
      energyThreshold: energy_threshold,
      zcrThreshold: zcr_threshold,
      vadLabels: [],
      voiceSegments: [],
    },
  });

  // Steps 4+: decision per frame (sample every 4 frames to keep step count manageable)
  const sampleIndices = [0, 4, 8, 12, 16, 19];
  for (const fi of sampleIndices) {
    if (fi >= allFrames.length) continue;
    const f = allFrames[fi];
    const decidedSoFar = allFrames.slice(0, fi + 1);
    const label = f.isSpeech ? "语音" : "静音";
    steps.push({
      id: stepId++,
      description: `帧 ${fi}：E = ${f.energy.toFixed(3)}，ZCR = ${f.zcr.toFixed(3)}。判决：E > θ_E(${energy_threshold}) ? ${f.energy > energy_threshold}；ZCR 在范围内 ? ${f.zcr > 0.05 && f.zcr < 0.6}。→ 该帧标记为【${label}】。`,
      data: {},
      variables: {
        phase: "decision",
        frames: JSON.stringify(decidedSoFar),
        currentFrameIdx: fi,
        energyThreshold: energy_threshold,
        zcrThreshold: zcr_threshold,
        vadLabels: JSON.stringify(decidedSoFar.map((x) => x.isSpeech ? 1 : 0)),
        voiceSegments: JSON.stringify(getVoiceSegments(decidedSoFar)),
      },
    });
  }

  // Final step
  const voiceSegments = getVoiceSegments(allFrames);
  const speechCount = allFrames.filter((f) => f.isSpeech).length;
  steps.push({
    id: stepId++,
    description: `VAD 完成！共检测到 ${voiceSegments.length} 个语音段，语音帧 ${speechCount} 帧（${((speechCount / allFrames.length) * 100).toFixed(0)}%），静音帧 ${allFrames.length - speechCount} 帧。双阈值判决有效区分语音与静音。`,
    data: {},
    variables: {
      phase: "complete",
      frames: JSON.stringify(allFrames),
      currentFrameIdx: allFrames.length - 1,
      energyThreshold: energy_threshold,
      zcrThreshold: zcr_threshold,
      vadLabels: JSON.stringify(allFrames.map((f) => f.isSpeech ? 1 : 0)),
      voiceSegments: JSON.stringify(voiceSegments),
      finished: true,
    },
  });

  return steps;
}
