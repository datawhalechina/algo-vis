import { VisualizationStep } from "@/types";

export type WordKey = "hello" | "world" | "speech" | "audio";

export const PHONEME_VOCAB = ["HH", "EH", "L", "OW", "W", "ER", "D", "S", "P", "IY", "CH", "AO"];

export const WORD_PHONEMES: Record<WordKey, string[]> = {
  hello:  ["HH", "EH", "L", "OW"],
  world:  ["W", "ER", "L", "D"],
  speech: ["S", "P", "IY", "CH"],
  audio:  ["AO", "D", "IY", "OW"],
};

// How many frames each phoneme spans
const PHONEME_FRAME_COUNTS: Record<WordKey, number[]> = {
  hello:  [2, 3, 4, 3],
  world:  [3, 4, 3, 2],
  speech: [3, 2, 4, 3],
  audio:  [4, 2, 3, 3],
};

// Simulated MFCC values (13-dim) per phoneme — represented as 4 representative values
const MFCC_PATTERNS: Record<string, number[]> = {
  HH: [0.82, 0.15, 0.32, 0.20],
  EH: [0.30, 0.75, 0.55, 0.28],
  L:  [0.45, 0.60, 0.40, 0.65],
  OW: [0.25, 0.80, 0.70, 0.35],
  W:  [0.20, 0.85, 0.75, 0.30],
  ER: [0.35, 0.65, 0.50, 0.70],
  D:  [0.65, 0.30, 0.25, 0.45],
  S:  [0.90, 0.10, 0.20, 0.15],
  P:  [0.75, 0.20, 0.15, 0.25],
  IY: [0.15, 0.90, 0.80, 0.20],
  CH: [0.80, 0.25, 0.18, 0.30],
  AO: [0.22, 0.78, 0.65, 0.40],
};

export interface PhonemeFrame {
  frameIdx: number;
  mfcc: number[];
  probs: Record<string, number>;
  truePhoneme: string;
}

export interface PhonemeAlignment {
  phoneme: string;
  startFrame: number;
  endFrame: number;
  duration: number;
}

function generatePhonemeProbs(truePhoneme: string, frameIdx: number): Record<string, number> {
  // Add a little per-frame variation using a seeded-like function
  const seed = (frameIdx * 7 + 13) % 17;
  const noise = seed * 0.01;

  const probs: Record<string, number> = {};
  let sum = 0;
  for (const ph of PHONEME_VOCAB) {
    // Base: high for true phoneme, lower for others with some acoustic similarity
    let base: number;
    if (ph === truePhoneme) {
      base = 0.65 + noise;
    } else {
      // Some confusable phonemes get higher probability
      const similar = getSimilarPhonemes(truePhoneme);
      base = similar.includes(ph) ? 0.10 + noise * 0.5 : 0.01 + noise * 0.2;
    }
    probs[ph] = base;
    sum += base;
  }
  // Normalize
  for (const ph of PHONEME_VOCAB) {
    probs[ph] = Number((probs[ph] / sum).toFixed(3));
  }
  return probs;
}

function getSimilarPhonemes(ph: string): string[] {
  const similarMap: Record<string, string[]> = {
    HH: ["CH", "S"],
    EH: ["IY", "AO"],
    L:  ["ER", "OW"],
    OW: ["AO", "W"],
    W:  ["OW", "ER"],
    ER: ["L", "OW"],
    D:  ["CH", "P"],
    S:  ["HH", "CH"],
    P:  ["D", "S"],
    IY: ["EH", "AO"],
    CH: ["S", "HH"],
    AO: ["OW", "IY"],
  };
  return similarMap[ph] ?? [];
}

function serializeFrames(frames: PhonemeFrame[]): string {
  return frames.map((f) => {
    const probStr = PHONEME_VOCAB.map((ph) => f.probs[ph].toFixed(3)).join(",");
    return `${f.frameIdx}:${f.truePhoneme}:${probStr}`;
  }).join("|");
}

function serializeAlignments(alns: PhonemeAlignment[]): string {
  return alns.map((a) => `${a.phoneme}:${a.startFrame}:${a.endFrame}`).join("|");
}

export function generatePhonemeRecognitionSteps(word: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const wk = (Object.keys(WORD_PHONEMES).includes(word) ? word : "hello") as WordKey;
  const phonemeSeq = WORD_PHONEMES[wk];
  const frameCounts = PHONEME_FRAME_COUNTS[wk];
  const totalFrames = frameCounts.reduce((a, b) => a + b, 0);

  // Build alignments
  const alignments: PhonemeAlignment[] = [];
  let frameOffset = 0;
  for (let pi = 0; pi < phonemeSeq.length; pi++) {
    const ph = phonemeSeq[pi];
    const count = frameCounts[pi];
    alignments.push({
      phoneme: ph,
      startFrame: frameOffset,
      endFrame: frameOffset + count - 1,
      duration: count,
    });
    frameOffset += count;
  }

  // Build all frames
  const allFrames: PhonemeFrame[] = [];
  for (const aln of alignments) {
    for (let f = aln.startFrame; f <= aln.endFrame; f++) {
      allFrames.push({
        frameIdx: f,
        mfcc: MFCC_PATTERNS[aln.phoneme],
        probs: generatePhonemeProbs(aln.phoneme, f),
        truePhoneme: aln.phoneme,
      });
    }
  }

  // Step 1: init
  steps.push({
    id: stepId++,
    description: `初始化：输入词语「${word}」，对应音素序列 [${phonemeSeq.join(" → ")}]（ARPAbet 标注）。共 ${totalFrames} 个语音帧，每帧时长约 10ms（采样率 16kHz，帧移 160 点）。`,
    data: { word, phonemeSeq, totalFrames },
    variables: {
      phase: "init",
      word,
      phonemeSeq: phonemeSeq.join(","),
      totalFrames,
    },
  });

  // Step 2: show phoneme sequence
  steps.push({
    id: stepId++,
    description: `词语「${word}」对应 ${phonemeSeq.length} 个音素，总帧数 ${totalFrames}。各音素持续帧数：${
      phonemeSeq.map((ph, i) => `${ph}=${frameCounts[i]}帧`).join("，")
    }。音素是语言学最小单位，对应独特的声学特征模式。`,
    data: { phonemeSeq, frameCounts },
    variables: {
      phase: "init",
      word,
      phonemeSeq: phonemeSeq.join(","),
      totalFrames,
      showPhonemes: "true",
    },
  });

  // Step 3: feature extraction per frame (show first few frames)
  const partialFrames: PhonemeFrame[] = [];
  for (let fi = 0; fi < allFrames.length; fi++) {
    partialFrames.push(allFrames[fi]);
    if (fi < 4) { // show first 4 frames individually
      steps.push({
        id: stepId++,
        description: `提取第 ${fi + 1}/${totalFrames} 帧的声学特征（MFCC）：梅尔频率倒谱系数捕获语音的短时频谱包络。` +
          `当前帧属于音素 /${allFrames[fi].truePhoneme}/，MFCC 特征：[${allFrames[fi].mfcc.map(v => v.toFixed(2)).join(", ")}]`,
        data: { frame: allFrames[fi] },
        variables: {
          phase: "feature",
          word,
          phonemeSeq: phonemeSeq.join(","),
          currentFrame: fi,
          frames: serializeFrames(partialFrames),
        },
      });
    }
  }

  // Step 4: model inference - show probability distributions frame by frame
  for (let fi = 0; fi < allFrames.length; fi++) {
    if (fi % 2 === 0 || fi === allFrames.length - 1) { // show every 2nd frame to avoid too many steps
      const topPh = PHONEME_VOCAB.reduce((a, b) =>
        allFrames[fi].probs[a] > allFrames[fi].probs[b] ? a : b
      );
      const topProb = allFrames[fi].probs[topPh];
      steps.push({
        id: stepId++,
        description: `声学模型（AM）处理第 ${fi + 1}/${totalFrames} 帧。` +
          `最高概率音素：/${topPh}/ (${(topProb * 100).toFixed(1)}%)。` +
          `P(q_t | x_t) 表示在当前帧观测值 x_t 下各音素的后验概率，是 HMM/CTC 对齐的基础。`,
        data: { frames: allFrames.slice(0, fi + 1) },
        variables: {
          phase: "model",
          word,
          phonemeSeq: phonemeSeq.join(","),
          currentFrame: fi,
          frames: serializeFrames(allFrames.slice(0, fi + 1)),
        },
      });
    }
  }

  // Step 5: alignment - show which frames belong to each phoneme
  steps.push({
    id: stepId++,
    description: `时间对齐（Viterbi 对齐）：将帧序列与音素序列对齐，找到每个音素的起止时间。` +
      `对齐结果：${alignments.map(a => `/${a.phoneme}/ 帧 ${a.startFrame + 1}-${a.endFrame + 1}`).join("，")}。`,
    data: { alignments, allFrames },
    variables: {
      phase: "alignment",
      word,
      phonemeSeq: phonemeSeq.join(","),
      frames: serializeFrames(allFrames),
      alignments: serializeAlignments(alignments),
    },
  });

  // Step 6: boundaries
  steps.push({
    id: stepId++,
    description: `音素边界标注：在时间轴上标记每个音素的转变点。边界时间（帧编号）：${
      alignments.slice(0, -1).map(a => `${a.endFrame + 1}/${totalFrames}`).join("，")
    }。精确的边界对于语音合成、语音识别评估至关重要。`,
    data: { alignments, allFrames },
    variables: {
      phase: "boundary",
      word,
      phonemeSeq: phonemeSeq.join(","),
      frames: serializeFrames(allFrames),
      alignments: serializeAlignments(alignments),
    },
  });

  // Step 7: complete
  steps.push({
    id: stepId++,
    description: `音素识别完成！词语「${word}」的音素序列：[${phonemeSeq.join(" ")}]，共 ${totalFrames} 帧，${
      phonemeSeq.length
    } 个音素。每个音素的时长（帧数）反映其在自然语音中的持续时间。`,
    data: { alignments, allFrames, finished: true },
    variables: {
      phase: "complete",
      word,
      phonemeSeq: phonemeSeq.join(","),
      frames: serializeFrames(allFrames),
      alignments: serializeAlignments(alignments),
      totalFrames,
      finished: "true",
    },
  });

  return steps;
}
