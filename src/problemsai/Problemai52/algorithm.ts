import { VisualizationStep } from "@/types";

export interface ASRFrame {
  frameIdx: number;
  probs: number[];
  argmaxChar: string;
}

// Vocabulary definitions per utterance
const UTTERANCES: Record<string, { vocab: string[]; pattern: number[][] }> = {
  hello: {
    vocab: ["h", "e", "l", "o", "_"],
    // Each row = frame, each col = prob for corresponding vocab char
    // Designed so CTC-decode gives "hello"
    pattern: [
      [0.85, 0.05, 0.03, 0.02, 0.05], // h
      [0.80, 0.08, 0.04, 0.02, 0.06], // h (repeat)
      [0.04, 0.86, 0.04, 0.02, 0.04], // e
      [0.02, 0.05, 0.86, 0.02, 0.05], // l
      [0.02, 0.03, 0.88, 0.02, 0.05], // l (repeat)
      [0.02, 0.03, 0.05, 0.04, 0.86], // blank
      [0.02, 0.03, 0.88, 0.02, 0.05], // l (2nd)
      [0.02, 0.03, 0.87, 0.03, 0.05], // l repeat
      [0.03, 0.03, 0.05, 0.85, 0.04], // o
      [0.02, 0.02, 0.04, 0.88, 0.04], // o repeat
      [0.02, 0.02, 0.04, 0.06, 0.86], // blank
      [0.02, 0.02, 0.04, 0.87, 0.05], // o
    ],
  },
  world: {
    vocab: ["w", "o", "r", "l", "d", "_"],
    pattern: [
      [0.86, 0.05, 0.03, 0.02, 0.02, 0.02],
      [0.84, 0.06, 0.03, 0.02, 0.02, 0.03],
      [0.04, 0.87, 0.03, 0.02, 0.01, 0.03],
      [0.03, 0.05, 0.86, 0.02, 0.01, 0.03],
      [0.02, 0.03, 0.05, 0.86, 0.01, 0.03],
      [0.02, 0.02, 0.04, 0.87, 0.02, 0.03],
      [0.02, 0.02, 0.03, 0.04, 0.86, 0.03],
      [0.01, 0.02, 0.02, 0.03, 0.88, 0.04],
      [0.02, 0.02, 0.02, 0.02, 0.06, 0.86],
      [0.02, 0.03, 0.86, 0.03, 0.02, 0.04],
      [0.02, 0.02, 0.03, 0.87, 0.02, 0.04],
      [0.01, 0.02, 0.02, 0.03, 0.87, 0.05],
    ],
  },
  你好: {
    vocab: ["你", "好", "我", "们", "_"],
    pattern: [
      [0.86, 0.04, 0.04, 0.02, 0.04],
      [0.84, 0.05, 0.04, 0.02, 0.05],
      [0.05, 0.04, 0.04, 0.02, 0.85],
      [0.05, 0.86, 0.03, 0.02, 0.04],
      [0.04, 0.87, 0.03, 0.02, 0.04],
      [0.03, 0.88, 0.03, 0.01, 0.05],
      [0.02, 0.06, 0.03, 0.01, 0.88],
      [0.02, 0.87, 0.03, 0.01, 0.07],
      [0.86, 0.04, 0.04, 0.02, 0.04],
      [0.85, 0.04, 0.04, 0.02, 0.05],
      [0.04, 0.87, 0.03, 0.01, 0.05],
      [0.03, 0.88, 0.03, 0.01, 0.05],
    ],
  },
};

function softmax(row: number[]): number[] {
  const max = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

function ctcCollapse(seq: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < seq.length; i++) {
    if (i === 0 || seq[i] !== seq[i - 1]) {
      result.push(seq[i]);
    }
  }
  return result;
}

export function generateASRSteps(utterance: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const key = utterance in UTTERANCES ? utterance : "hello";
  const { vocab, pattern } = UTTERANCES[key];
  const blankChar = "_";
  const T = pattern.length;

  // Normalize probabilities via softmax
  const probMatrix = pattern.map((row) => softmax(row));

  // Step 1: init
  steps.push({
    id: stepId++,
    description: `初始化 CTC-ASR 解码器。输入语音：「${utterance}」，词汇表大小 |V| = ${vocab.length}（含空白符 '_'），时间帧数 T = ${T}。`,
    data: {},
    variables: {
      phase: "init",
      utterance,
      vocab: JSON.stringify(vocab),
      probMatrix: JSON.stringify(probMatrix),
      rawSeq: JSON.stringify([]),
      collapsedSeq: JSON.stringify([]),
      finalText: "",
      currentFrame: -1,
      T,
    },
  });

  // Step 2: acoustic - show full probability matrix
  steps.push({
    id: stepId++,
    description: `声学模型输出概率矩阵 P ∈ ℝ^{T×|V|}。每行为一个时间帧，每列为一个字符的后验概率（经 Softmax 归一化）。颜色越深表示概率越高。`,
    data: {},
    variables: {
      phase: "acoustic",
      utterance,
      vocab: JSON.stringify(vocab),
      probMatrix: JSON.stringify(probMatrix),
      rawSeq: JSON.stringify([]),
      collapsedSeq: JSON.stringify([]),
      finalText: "",
      currentFrame: T - 1,
      T,
    },
  });

  // Steps 3+: argmax per frame (show 4 sample frames)
  const sampleFrames = [0, 3, 6, 9, T - 1].filter((v) => v < T);
  for (const fi of sampleFrames) {
    const probs = probMatrix[fi];
    const maxIdx = probs.indexOf(Math.max(...probs));
    const char = vocab[maxIdx];
    const rawSoFar = probMatrix.slice(0, fi + 1).map((row) => {
      const mi = row.indexOf(Math.max(...row));
      return vocab[mi];
    });
    steps.push({
      id: stepId++,
      description: `帧 ${fi}：argmax P(·|x_${fi}) = '${char}'（概率 ${(probs[maxIdx] * 100).toFixed(1)}%）。对每帧取概率最高字符，得到原始序列（含重复和空白）。`,
      data: {},
      variables: {
        phase: "argmax",
        utterance,
        vocab: JSON.stringify(vocab),
        probMatrix: JSON.stringify(probMatrix),
        rawSeq: JSON.stringify(rawSoFar),
        collapsedSeq: JSON.stringify([]),
        finalText: "",
        currentFrame: fi,
        T,
      },
    });
  }

  // Full raw sequence
  const rawSeq = probMatrix.map((row) => {
    const mi = row.indexOf(Math.max(...row));
    return vocab[mi];
  });

  // Step: collapse
  const collapsedSeq = ctcCollapse(rawSeq);
  steps.push({
    id: stepId++,
    description: `折叠连续重复字符：原始序列 [${rawSeq.join(", ")}] → 折叠后 [${collapsedSeq.join(", ")}]。CTC 规定连续相同字符视为同一字符的一次发音。`,
    data: {},
    variables: {
      phase: "collapse",
      utterance,
      vocab: JSON.stringify(vocab),
      probMatrix: JSON.stringify(probMatrix),
      rawSeq: JSON.stringify(rawSeq),
      collapsedSeq: JSON.stringify(collapsedSeq),
      finalText: "",
      currentFrame: T - 1,
      T,
    },
  });

  // Step: remove blanks
  const finalChars = collapsedSeq.filter((c) => c !== blankChar);
  const finalText = finalChars.join("");
  steps.push({
    id: stepId++,
    description: `删除空白符 '_'：折叠序列 [${collapsedSeq.join(", ")}] → 最终文本「${finalText}」。空白符用于分隔同字母的重复出现（如 "ll" 在 hello 中）。`,
    data: {},
    variables: {
      phase: "blank_remove",
      utterance,
      vocab: JSON.stringify(vocab),
      probMatrix: JSON.stringify(probMatrix),
      rawSeq: JSON.stringify(rawSeq),
      collapsedSeq: JSON.stringify(collapsedSeq),
      finalText,
      currentFrame: T - 1,
      T,
    },
  });

  // Final
  steps.push({
    id: stepId++,
    description: `CTC 解码完成！输入语音「${utterance}」成功转写为文本「${finalText}」。CTC 允许网络学习不定长对齐，无需手工标注帧级别标签。`,
    data: {},
    variables: {
      phase: "complete",
      utterance,
      vocab: JSON.stringify(vocab),
      probMatrix: JSON.stringify(probMatrix),
      rawSeq: JSON.stringify(rawSeq),
      collapsedSeq: JSON.stringify(collapsedSeq),
      finalText,
      currentFrame: T - 1,
      T,
      finished: true,
    },
  });

  return steps;
}
