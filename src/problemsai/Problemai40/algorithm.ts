import { VisualizationStep } from "@/types";

export interface SentimentSample {
  text: string;
  words: Array<{
    word: string;
    score: number;       // -1 to 1
    isNegation: boolean;
    isDegree: boolean;
    degreeMultiplier: number;
  }>;
  trueLabel: "正面" | "负面" | "中性";
}

export const DEFAULT_SENTIMENT_SAMPLES: SentimentSample[] = [
  {
    text: "这个产品非常好用，强烈推荐！",
    words: [
      { word: "这个", score: 0, isNegation: false, isDegree: false, degreeMultiplier: 1.0 },
      { word: "产品", score: 0, isNegation: false, isDegree: false, degreeMultiplier: 1.0 },
      { word: "非常", score: 0, isNegation: false, isDegree: true, degreeMultiplier: 1.5 },
      { word: "好用", score: 0.8, isNegation: false, isDegree: false, degreeMultiplier: 1.0 },
      { word: "强烈", score: 0, isNegation: false, isDegree: true, degreeMultiplier: 1.4 },
      { word: "推荐", score: 0.75, isNegation: false, isDegree: false, degreeMultiplier: 1.0 },
    ],
    trueLabel: "正面",
  },
  {
    text: "真的不好，完全没有用处",
    words: [
      { word: "真的", score: 0, isNegation: false, isDegree: true, degreeMultiplier: 1.2 },
      { word: "不", score: 0, isNegation: true, isDegree: false, degreeMultiplier: 1.0 },
      { word: "好", score: 0.7, isNegation: false, isDegree: false, degreeMultiplier: 1.0 },
      { word: "完全", score: 0, isNegation: false, isDegree: true, degreeMultiplier: 1.5 },
      { word: "没有", score: 0, isNegation: true, isDegree: false, degreeMultiplier: 1.0 },
      { word: "用处", score: 0.5, isNegation: false, isDegree: false, degreeMultiplier: 1.0 },
    ],
    trueLabel: "负面",
  },
];

export function generateSentimentAnalysisSteps(sample: SentimentSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化情感分析：输入文本 "${sample.text}"。识别情感词、否定词和程度词，通过规则或模型计算情感得分。`,
    data: { sample },
    variables: { phase: "init", sample },
  });

  const processedWords: Array<{ word: string; rawScore: number; finalScore: number; negation: boolean; degree: number }> = [];
  let pendingNegation = false;
  let pendingDegree = 1.0;
  let stepWords = [...sample.words];

  for (let i = 0; i < stepWords.length; i++) {
    const w = stepWords[i];
    let desc = "";
    let rawScore = w.score;
    let finalScore = 0;
    let negation = false;
    let degree = 1.0;

    if (w.isNegation) {
      pendingNegation = true;
      desc = `"${w.word}" 是否定词，将翻转下一个情感词的极性`;
    } else if (w.isDegree) {
      pendingDegree = w.degreeMultiplier;
      desc = `"${w.word}" 是程度词，乘数 = ${w.degreeMultiplier}，将放大下一个情感词`;
    } else if (rawScore !== 0) {
      negation = pendingNegation;
      degree = pendingDegree;
      finalScore = Number((rawScore * degree * (pendingNegation ? -1 : 1)).toFixed(4));
      desc = `"${w.word}" 是情感词，原始分 ${rawScore}${pendingNegation ? "（否定→取反）" : ""}${pendingDegree !== 1 ? `×程度 ${pendingDegree}` : ""} = ${finalScore}`;
      pendingNegation = false;
      pendingDegree = 1.0;
    } else {
      desc = `"${w.word}" 为中性词，跳过`;
    }

    processedWords.push({ word: w.word, rawScore, finalScore, negation, degree });

    steps.push({
      id: stepId++,
      description: desc,
      data: { word: w, finalScore },
      variables: {
        phase: "word-analysis",
        currentIdx: i,
        processedWords: [...processedWords],
        sample,
      },
    });
  }

  const totalScore = Number((processedWords.reduce((s, w) => s + w.finalScore, 0)).toFixed(4));
  const normalizedScore = Number((Math.max(-1, Math.min(1, totalScore / 2))).toFixed(4));

  steps.push({
    id: stepId++,
    description: `汇总情感得分：\\text{score} = \\sum_i \\text{finalScore}_i = ${totalScore.toFixed(4)}，归一化到 [-1, 1]：${normalizedScore.toFixed(4)}`,
    data: { totalScore, normalizedScore },
    variables: { phase: "aggregate", totalScore, normalizedScore, processedWords, sample },
  });

  const label = normalizedScore > 0.2 ? "正面" : normalizedScore < -0.2 ? "负面" : "中性";
  const isCorrect = label === sample.trueLabel;

  steps.push({
    id: stepId++,
    description: `情感分析完成！得分 ${normalizedScore.toFixed(4)} → 类别"${label}"。真实标签"${sample.trueLabel}"，${isCorrect ? "✓ 正确" : "✗ 错误"}`,
    data: { label, normalizedScore, isCorrect, finished: true },
    variables: {
      phase: "complete",
      label,
      normalizedScore,
      totalScore,
      processedWords,
      isCorrect,
      sample,
      finished: true,
    },
  });

  return steps;
}
