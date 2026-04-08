import { VisualizationStep } from "@/types";

export interface TTSPhoneme {
  char: string;
  phoneme: string;
  duration: number; // number of mel frames for this phoneme
}

// Simple char → phoneme mapping
const CHAR_TO_PHONEME: Record<string, string> = {
  // Chinese
  你: "nǐ", 好: "hǎo", 世: "shì", 界: "jiè",
  人: "rén", 工: "gōng", 智: "zhì", 能: "néng",
  // English
  H: "HH", e: "EH", l: "L", o: "OW",
  W: "W", r: "R", d: "D",
  " ": "sp",
};

function getPhoneme(ch: string): string {
  return CHAR_TO_PHONEME[ch] ?? ch.toUpperCase();
}

// Pseudo-random duration per phoneme (deterministic based on phoneme)
function getDuration(phoneme: string): number {
  let hash = 0;
  for (let i = 0; i < phoneme.length; i++) hash = (hash * 31 + phoneme.charCodeAt(i)) & 0xffff;
  return 2 + (hash % 4); // 2-5 frames
}

// Generate simplified mel spectrogram row (8 mel bands)
function getMelRow(phonemeIdx: number, frameInPhoneme: number, totalPhonemes: number): number[] {
  const mel: number[] = [];
  const base = (phonemeIdx / totalPhonemes) * 0.6 + 0.1;
  for (let b = 0; b < 8; b++) {
    const val = base + Math.sin((phonemeIdx * 2.7 + b * 1.3 + frameInPhoneme * 0.5) * 0.8) * 0.2;
    mel.push(Math.max(0.05, Math.min(0.95, val)));
  }
  return mel;
}

// Generate waveform amplitude from mel (simplified)
function melToWaveform(melSpec: number[][]): number[] {
  return melSpec.map((row) => {
    const avg = row.reduce((a, b) => a + b, 0) / row.length;
    // oscillate around average
    return avg;
  });
}

function buildAttentionMatrix(phonemes: TTSPhoneme[]): number[][] {
  // Each mel frame attends mostly to one phoneme
  const totalFrames = phonemes.reduce((s, p) => s + p.duration, 0);
  const P = phonemes.length;
  const matrix: number[][] = [];

  for (let pi = 0; pi < P; pi++) {
    for (let fi = 0; fi < phonemes[pi].duration; fi++) {
      const row = new Array(P).fill(0.02);
      // main attention on current phoneme, slight spread
      row[pi] = 0.85;
      if (pi > 0) row[pi - 1] = 0.08;
      if (pi < P - 1) row[pi + 1] = 0.05;
      matrix.push(row);
    }
  }
  // Pad/trim to totalFrames
  while (matrix.length < totalFrames) matrix.push(new Array(P).fill(1 / P));
  return matrix.slice(0, totalFrames);
}

export function generateTTSSteps(text: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const chars = text.split("");

  // Step 1: init
  steps.push({
    id: stepId++,
    description: `初始化 Tacotron 式 TTS 系统。输入文本：「${text}」，包含 ${chars.length} 个字符。TTS 流程：文本 → 音素 → 时长预测 → 对齐矩阵 → 梅尔频谱 → 波形。`,
    data: {},
    variables: {
      phase: "init",
      text,
      phonemes: JSON.stringify([]),
      durations: JSON.stringify([]),
      alignmentMatrix: JSON.stringify([]),
      melSpec: JSON.stringify([]),
      waveform: JSON.stringify([]),
      currentPhoneme: -1,
      totalFrames: 0,
    },
  });

  // Build phonemes
  const phonemes: TTSPhoneme[] = chars.map((ch) => {
    const phoneme = getPhoneme(ch);
    return { char: ch, phoneme, duration: getDuration(phoneme) };
  });

  // Step 2: phoneme
  steps.push({
    id: stepId++,
    description: `文本分析：将输入字符映射为音素序列。「${text}」→ [${phonemes.map((p) => p.phoneme).join(", ")}]。音素是语音的基本单位，英文使用 ARPAbet，中文使用拼音音素。`,
    data: {},
    variables: {
      phase: "phoneme",
      text,
      phonemes: JSON.stringify(phonemes),
      durations: JSON.stringify([]),
      alignmentMatrix: JSON.stringify([]),
      melSpec: JSON.stringify([]),
      waveform: JSON.stringify([]),
      currentPhoneme: phonemes.length - 1,
      totalFrames: 0,
    },
  });

  // Step 3: duration
  const durations = phonemes.map((p) => p.duration);
  const totalFrames = durations.reduce((a, b) => a + b, 0);
  steps.push({
    id: stepId++,
    description: `时长预测：为每个音素预测持续帧数。[${phonemes.map((p) => `${p.phoneme}:${p.duration}`).join(", ")}]，共 ${totalFrames} 个梅尔帧。时长决定音素在频谱上的宽度。`,
    data: {},
    variables: {
      phase: "duration",
      text,
      phonemes: JSON.stringify(phonemes),
      durations: JSON.stringify(durations),
      alignmentMatrix: JSON.stringify([]),
      melSpec: JSON.stringify([]),
      waveform: JSON.stringify([]),
      currentPhoneme: -1,
      totalFrames,
    },
  });

  // Step 4: alignment
  const alignmentMatrix = buildAttentionMatrix(phonemes);
  steps.push({
    id: stepId++,
    description: `注意力对齐矩阵（${totalFrames} 梅尔帧 × ${phonemes.length} 音素）：每个梅尔帧主要关注对应的音素（对角线主导）。对齐矩阵指导频谱生成顺序。`,
    data: {},
    variables: {
      phase: "alignment",
      text,
      phonemes: JSON.stringify(phonemes),
      durations: JSON.stringify(durations),
      alignmentMatrix: JSON.stringify(alignmentMatrix),
      melSpec: JSON.stringify([]),
      waveform: JSON.stringify([]),
      currentPhoneme: -1,
      totalFrames,
    },
  });

  // Step 5: mel_gen - generate mel spectrogram frame by frame (show 3 sample points)
  const melSpec: number[][] = [];
  for (let pi = 0; pi < phonemes.length; pi++) {
    for (let fi = 0; fi < phonemes[pi].duration; fi++) {
      melSpec.push(getMelRow(pi, fi, phonemes.length));
    }
  }

  const samplePhonemes = [0, Math.floor(phonemes.length / 2), phonemes.length - 1];
  for (const pi of samplePhonemes) {
    const startFrame = phonemes.slice(0, pi).reduce((s, p) => s + p.duration, 0);
    const endFrame = startFrame + phonemes[pi].duration;
    steps.push({
      id: stepId++,
      description: `生成音素「${phonemes[pi].phoneme}」的梅尔频谱（帧 ${startFrame}–${endFrame - 1}，共 ${phonemes[pi].duration} 帧，8 个梅尔频带）。低频带（左）能量通常较高。`,
      data: {},
      variables: {
        phase: "mel_gen",
        text,
        phonemes: JSON.stringify(phonemes),
        durations: JSON.stringify(durations),
        alignmentMatrix: JSON.stringify(alignmentMatrix),
        melSpec: JSON.stringify(melSpec.slice(0, endFrame)),
        waveform: JSON.stringify([]),
        currentPhoneme: pi,
        totalFrames,
      },
    });
  }

  // Step 6: vocoder
  const waveform = melToWaveform(melSpec);
  steps.push({
    id: stepId++,
    description: `神经声码器（Vocoder）将梅尔频谱转换为波形。简化示意：取各帧梅尔能量均值，通过 WaveNet/HiFi-GAN 合成高质量音频波形（${waveform.length} 个采样段）。`,
    data: {},
    variables: {
      phase: "vocoder",
      text,
      phonemes: JSON.stringify(phonemes),
      durations: JSON.stringify(durations),
      alignmentMatrix: JSON.stringify(alignmentMatrix),
      melSpec: JSON.stringify(melSpec),
      waveform: JSON.stringify(waveform),
      currentPhoneme: -1,
      totalFrames,
    },
  });

  // Final
  steps.push({
    id: stepId++,
    description: `TTS 合成完成！文本「${text}」经过音素分析 → 时长预测 → 对齐 → ${melSpec.length} 帧梅尔频谱 → 波形输出。整个流程无需录音，端到端可学习。`,
    data: {},
    variables: {
      phase: "complete",
      text,
      phonemes: JSON.stringify(phonemes),
      durations: JSON.stringify(durations),
      alignmentMatrix: JSON.stringify(alignmentMatrix),
      melSpec: JSON.stringify(melSpec),
      waveform: JSON.stringify(waveform),
      currentPhoneme: -1,
      totalFrames,
      finished: true,
    },
  });

  return steps;
}
