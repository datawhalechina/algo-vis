import { VisualizationStep } from "@/types";

export type ReferenceSpeaker = "Alice" | "Bob" | "Charlie";
export type TargetText = "你好" | "谢谢" | "再见";

const SPEAKER_EMBEDDINGS: Record<ReferenceSpeaker, number[]> = {
  Alice: [0.92, 0.15, 0.67, 0.23, 0.88, 0.31],
  Bob: [0.18, 0.89, 0.24, 0.76, 0.12, 0.93],
  Charlie: [0.61, 0.42, 0.85, 0.38, 0.55, 0.72],
};

const SPEAKER_DESC: Record<ReferenceSpeaker, string> = {
  Alice: "明亮女声，高频能量强",
  Bob: "低沉男声，低频能量强",
  Charlie: "中性声音，频谱均匀",
};

const TEXT_PHONEMES: Record<TargetText, string[]> = {
  你好: ["n", "ǐ", "h", "ǎo"],
  谢谢: ["x", "iè", "x", "iè"],
  再见: ["z", "ài", "j", "iàn"],
};

const PHONEME_DURATIONS = [3, 4, 3, 5];

function generateMelSpec(embedding: number[], numPhonemes: number, numMelBands: number = 8): number[][] {
  const mel: number[][] = [];
  const speakerBias = embedding.slice(0, numMelBands).map((v) => v * 0.5);
  let frameIdx = 0;
  for (let p = 0; p < numPhonemes; p++) {
    const dur = PHONEME_DURATIONS[p] ?? 3;
    for (let f = 0; f < dur; f++) {
      const row: number[] = [];
      for (let m = 0; m < numMelBands; m++) {
        const phonemeF = Math.exp(-0.5 * Math.pow((m - 2 - p) / 2, 2));
        const val = Math.min(1, Math.max(0, phonemeF * 0.7 + speakerBias[m] + Math.sin(frameIdx * 0.8 + m) * 0.1));
        row.push(Number(val.toFixed(3)));
      }
      mel.push(row);
      frameIdx++;
    }
  }
  return mel;
}

function generateWaveform(melSpec: number[][]): number[] {
  const waveform: number[] = [];
  for (const frame of melSpec) {
    const energy = frame.reduce((a, b) => a + b, 0) / frame.length;
    for (let i = 0; i < 4; i++) {
      const t = waveform.length;
      waveform.push(Number((energy * Math.sin(t * 0.5) * 0.8).toFixed(3)));
    }
  }
  return waveform;
}

export function generateVoiceCloningSteps(
  referenceSpeaker: ReferenceSpeaker,
  targetText: TargetText
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const speakerEmbedding = SPEAKER_EMBEDDINGS[referenceSpeaker];
  const phonemes = TEXT_PHONEMES[targetText];
  const melSpec = generateMelSpec(speakerEmbedding, phonemes.length);
  const waveform = generateWaveform(melSpec);
  const embStr = speakerEmbedding.map((v) => v.toFixed(2)).join(",");
  const melRowsFull = melSpec.map((row) => row.join(",")).join(";");
  const waveStr = waveform.slice(0, 40).map((v) => v.toFixed(3)).join(",");

  steps.push({
    id: id++,
    description: `初始化：参考说话人 "${referenceSpeaker}"（${SPEAKER_DESC[referenceSpeaker]}），目标文本「${targetText}」。语音克隆目标：用 ${referenceSpeaker} 的声音说出「${targetText}」。`,
    data: { referenceSpeaker, targetText },
    variables: { phase: "init", referenceSpeaker, targetText, speakerDesc: SPEAKER_DESC[referenceSpeaker] },
  });

  steps.push({
    id: id++,
    description: `说话人编码器：将 ${referenceSpeaker} 的参考音频通过说话人编码器，提取 6 维说话人嵌入向量 e_spk = [${embStr}]。嵌入向量捕获了声纹特征：音调、音色、共振峰等。`,
    data: { speakerEmbedding },
    variables: { phase: "speaker_encode", referenceSpeaker, targetText, embStr },
  });

  steps.push({
    id: id++,
    description: `文本编码：将目标文本「${targetText}」转换为音素序列 [${phonemes.join(", ")}]。共 ${phonemes.length} 个音素，预测总时长约 ${PHONEME_DURATIONS.reduce((a, b) => a + b, 0) * 25}ms。`,
    data: { phonemes, durations: PHONEME_DURATIONS },
    variables: {
      phase: "text_encode",
      referenceSpeaker,
      targetText,
      phonemes: phonemes.join(","),
      durations: PHONEME_DURATIONS.join(","),
      embStr,
    },
  });

  const partialSizes = [
    Math.floor(melSpec.length / 3),
    Math.floor(melSpec.length * 2 / 3),
    melSpec.length,
  ];

  for (let pi = 0; pi < partialSizes.length; pi++) {
    const n = partialSizes[pi];
    const partialMel = melSpec.slice(0, n);
    steps.push({
      id: id++,
      description: `合成器（第 ${pi + 1}/3 阶段）：融合音素嵌入与说话人嵌入 e_spk，自回归生成梅尔频谱。已生成 ${n}/${melSpec.length} 帧（${Math.round(n / melSpec.length * 100)}%）。`,
      data: { partialMel },
      variables: {
        phase: "synthesize",
        referenceSpeaker,
        targetText,
        phonemes: phonemes.join(","),
        embStr,
        melRows: partialMel.map((row) => row.join(",")).join(";"),
        melFrames: n,
        totalFrames: melSpec.length,
        melBands: 8,
      },
    });
  }

  steps.push({
    id: id++,
    description: `声码器（Vocoder）：将 ${melSpec.length} 帧梅尔频谱转换为时域音频波形，生成约 ${(melSpec.length * 25 / 1000).toFixed(2)}s 的 ${referenceSpeaker} 音色的「${targetText}」语音。`,
    data: { waveform },
    variables: {
      phase: "vocoder",
      referenceSpeaker,
      targetText,
      embStr,
      waveformStr: waveStr,
      melRows: melRowsFull,
      melBands: 8,
    },
  });

  steps.push({
    id: id++,
    description: `克隆完成！用 "${referenceSpeaker}" 的声音成功合成了「${targetText}」。流程：参考音频 → 说话人嵌入 → 合成器（融合说话人+文本）→ 声码器 → 克隆音频。`,
    data: { referenceSpeaker, targetText, melSpec, waveform, finished: true },
    variables: {
      phase: "complete",
      referenceSpeaker,
      targetText,
      embStr,
      waveformStr: waveStr,
      melRows: melRowsFull,
      melBands: 8,
      finished: true,
    },
  });

  return steps;
}
