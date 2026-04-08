import { VisualizationStep } from "@/types";

export type SentenceType = "疑问句" | "陈述句" | "感叹句" | "命令句";

export interface ProsodyData {
  sentenceType: SentenceType;
  f0Values: number[];
  stressMarks: boolean[];
  rhythmPattern: number[];
  meanF0: number;
  f0Range: number;
  rhythmRate: number;
  prosodyDesc: string;
}

const SENTENCE_CONFIGS: Record<
  SentenceType,
  { desc: string; f0Base: number[]; pattern: string }
> = {
  疑问句: {
    desc: "末尾音调上扬，表达不确定性或请求确认",
    f0Base: [
      130, 128, 125, 122, 120, 121, 123, 126, 130, 136, 143, 152, 163, 176,
      191, 208,
    ],
    pattern: "低-平-升",
  },
  陈述句: {
    desc: "整体平稳，末尾略微下降，表达客观事实",
    f0Base: [
      145, 148, 150, 151, 150, 149, 148, 147, 146, 145, 143, 141, 138, 135,
      131, 127,
    ],
    pattern: "平-微降",
  },
  感叹句: {
    desc: "整体音调高，带有戏剧性下降，表达强烈情感",
    f0Base: [
      200, 210, 220, 215, 205, 195, 185, 175, 165, 155, 145, 135, 125, 118,
      113, 110,
    ],
    pattern: "高-急降",
  },
  命令句: {
    desc: "起始音调高而尖锐，随后维持在中等水平",
    f0Base: [
      220, 215, 200, 185, 170, 162, 158, 155, 153, 152, 151, 150, 149, 148,
      148, 147,
    ],
    pattern: "急降-平",
  },
};

function computeMean(arr: number[]): number {
  return Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1));
}

function computeRange(arr: number[]): number {
  return Number((Math.max(...arr) - Math.min(...arr)).toFixed(1));
}

export function generateProsodySteps(sentenceType: SentenceType): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const config = SENTENCE_CONFIGS[sentenceType] ?? SENTENCE_CONFIGS["陈述句"];
  const f0Values = config.f0Base;
  const numFrames = f0Values.length;

  // Stress marks: every 3-4 frames, considering F0 local maxima
  const stressMarks: boolean[] = Array(numFrames).fill(false);
  for (let i = 1; i < numFrames - 1; i += 3) {
    if (f0Values[i] >= f0Values[i - 1] && f0Values[i] >= f0Values[i + 1]) {
      stressMarks[i] = true;
    } else {
      stressMarks[i] = true; // mark every 3rd anyway
    }
  }

  // Rhythm pattern: duration weights (stressed syllables are longer)
  const rhythmPattern: number[] = stressMarks.map((s) => (s ? 2 : 1));

  const meanF0 = computeMean(f0Values);
  const f0Range = computeRange(f0Values);
  const stressCount = stressMarks.filter(Boolean).length;
  const rhythmRate = Number((stressCount / (numFrames * 0.025)).toFixed(2)); // stress events per second (25ms per frame)

  // Step 1: init
  steps.push({
    id: id++,
    description: `初始化韵律分析：输入语句类型为「${sentenceType}」。${config.desc}。韵律特征包括基频（F0）、时长（节奏）和能量（重音）三个维度。`,
    data: { sentenceType, prosodyDesc: config.desc },
    variables: {
      phase: "init",
      sentenceType,
      prosodyDesc: config.desc,
      rhythmPattern: config.pattern,
    },
  });

  // Step 2: f0_extract - build F0 contour progressively
  const partialF0_1 = f0Values.slice(0, 4);
  steps.push({
    id: id++,
    description: `提取F0轮廓（第1-4帧）：基频 F_0 = 1/T_0，从语音波形周期计算。${sentenceType}模式为「${config.pattern}」，当前F0区间：${Math.min(...partialF0_1).toFixed(0)}–${Math.max(...partialF0_1).toFixed(0)} Hz`,
    data: { f0Values: partialF0_1 },
    variables: {
      phase: "f0_extract",
      sentenceType,
      f0Values: partialF0_1,
      stressMarks: Array(4).fill(false),
      rhythmPattern: Array(4).fill(1),
    },
  });

  const partialF0_2 = f0Values.slice(0, 8);
  steps.push({
    id: id++,
    description: `提取F0轮廓（第1-8帧）：ΔF0 = F0(t) - F0(t-1) 描述音调变化趋势。当前音调${partialF0_2[7] > partialF0_2[0] ? "上升" : "下降"}趋势，ΔF0 = ${(partialF0_2[7] - partialF0_2[0]).toFixed(0)} Hz`,
    data: { f0Values: partialF0_2 },
    variables: {
      phase: "f0_extract",
      sentenceType,
      f0Values: partialF0_2,
      stressMarks: Array(8).fill(false),
      rhythmPattern: Array(8).fill(1),
    },
  });

  const partialF0_3 = f0Values.slice(0, 12);
  steps.push({
    id: id++,
    description: `提取F0轮廓（第1-12帧）：${sentenceType}的音调走势逐渐清晰，继续追踪基频变化。F0范围扩展至 ${Math.min(...partialF0_3).toFixed(0)}–${Math.max(...partialF0_3).toFixed(0)} Hz`,
    data: { f0Values: partialF0_3 },
    variables: {
      phase: "f0_extract",
      sentenceType,
      f0Values: partialF0_3,
      stressMarks: Array(12).fill(false),
      rhythmPattern: Array(12).fill(1),
    },
  });

  steps.push({
    id: id++,
    description: `F0轮廓提取完成（全部${numFrames}帧）：${sentenceType}的基频范围为 ${Math.min(...f0Values).toFixed(0)}–${Math.max(...f0Values).toFixed(0)} Hz，整体轮廓呈现「${config.pattern}」形态。`,
    data: { f0Values },
    variables: {
      phase: "f0_extract",
      sentenceType,
      f0Values,
      stressMarks: Array(numFrames).fill(false),
      rhythmPattern: Array(numFrames).fill(1),
    },
  });

  // Step 3: rhythm - compute rhythm pattern
  steps.push({
    id: id++,
    description: `计算节奏模式：通过分析相邻帧的能量和时长，识别重读与非重读音节。重读音节时长约为非重读音节的2倍，形成「强-弱-弱」或「强-弱」节奏单元。`,
    data: { rhythmPattern, f0Values },
    variables: {
      phase: "rhythm",
      sentenceType,
      f0Values,
      stressMarks: Array(numFrames).fill(false),
      rhythmPattern,
    },
  });

  // Step 4: stress - identify stress points
  const partialStress = stressMarks.slice();
  steps.push({
    id: id++,
    description: `标注重音点：结合F0局部极值和能量分布，识别出 ${stressCount} 个重音位置（帧序号：${stressMarks.map((s, i) => (s ? i : -1)).filter((i) => i >= 0).join(", ")}）。重音承载语义和语气信息。`,
    data: { stressMarks: partialStress, f0Values },
    variables: {
      phase: "stress",
      sentenceType,
      f0Values,
      stressMarks: partialStress,
      rhythmPattern,
    },
  });

  // Step 5: analyze - compute statistics
  steps.push({
    id: id++,
    description: `计算韵律统计特征：平均F0 = ${meanF0} Hz，F0范围 = ${f0Range} Hz，节奏率 = ${rhythmRate} 重音/秒。这些特征共同构成该语句的韵律指纹。`,
    data: { meanF0, f0Range, rhythmRate },
    variables: {
      phase: "analyze",
      sentenceType,
      f0Values,
      stressMarks,
      rhythmPattern,
      meanF0,
      f0Range,
      rhythmRate,
    },
  });

  // Step 6: complete
  steps.push({
    id: id++,
    description: `韵律分析完成！${sentenceType}特征向量：[平均F0=${meanF0}Hz, F0范围=${f0Range}Hz, 重音率=${rhythmRate}/s, 模式=${config.pattern}]。该特征向量可用于语气识别、情感分析和语音合成。`,
    data: { meanF0, f0Range, rhythmRate, f0Values, stressMarks, rhythmPattern, finished: true },
    variables: {
      phase: "complete",
      sentenceType,
      f0Values,
      stressMarks,
      rhythmPattern,
      meanF0,
      f0Range,
      rhythmRate,
      prosodyDesc: config.desc,
      finished: true,
    },
  });

  return steps;
}
