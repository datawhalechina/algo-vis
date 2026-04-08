import { VisualizationStep } from "@/types";

export interface TextClassificationSample {
  text: string;
  words: string[];
  tfidf: Record<string, number>;
  trueLabel: string;
}

export const CATEGORIES = ["正面", "负面", "中性"];

export const DEFAULT_SAMPLES: TextClassificationSample[] = [
  {
    text: "这部电影真的很棒！演技精彩，剧情感人。",
    words: ["电影", "很棒", "演技", "精彩", "剧情", "感人"],
    tfidf: { "很棒": 0.85, "精彩": 0.78, "感人": 0.72, "电影": 0.30, "演技": 0.55, "剧情": 0.40 },
    trueLabel: "正面",
  },
  {
    text: "服务态度太差了，完全不推荐！",
    words: ["服务", "态度", "太差", "不推荐"],
    tfidf: { "太差": 0.88, "不推荐": 0.82, "服务": 0.45, "态度": 0.50 },
    trueLabel: "负面",
  },
  {
    text: "产品一般，没什么特别的感觉。",
    words: ["产品", "一般", "没什么", "特别"],
    tfidf: { "一般": 0.60, "没什么": 0.55, "产品": 0.35, "特别": 0.40 },
    trueLabel: "中性",
  },
];

const CLASS_WEIGHTS: Record<string, Record<string, number>> = {
  "正面": { "很棒": 2.0, "精彩": 1.8, "感人": 1.6, "推荐": 1.5, "电影": 0.1, "演技": 0.8 },
  "负面": { "太差": 2.2, "不推荐": 2.0, "差": 1.9, "失望": 1.7, "服务": 0.5, "态度": 0.6 },
  "中性": { "一般": 1.5, "没什么": 1.3, "普通": 1.4, "还好": 1.2, "产品": 0.3, "特别": 0.2 },
};

export function generateTextClassificationSteps(
  sample: TextClassificationSample
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `初始化文本分类：输入文本 "${sample.text}"，分词为 ${sample.words.length} 个词语，类别集合 = {${CATEGORIES.join(", ")}}`,
    data: { sample },
    variables: { phase: "init", sample, categories: CATEGORIES },
  });

  steps.push({
    id: stepId++,
    description: `分词并提取 TF-IDF 特征。TF-IDF 公式：\\text{TF-IDF}(t,d) = \\text{TF}(t,d) \\times \\log\\frac{N}{\\text{DF}(t)}。高分词语对分类影响更大。`,
    data: { tfidf: sample.tfidf },
    variables: { phase: "feature", tfidf: sample.tfidf, words: sample.words, sample },
  });

  const classScores: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    let score = 0;
    const weights = CLASS_WEIGHTS[cat] ?? {};
    for (const [word, tfidf] of Object.entries(sample.tfidf)) {
      score += tfidf * (weights[word] ?? 0.1);
    }
    classScores[cat] = Number(score.toFixed(4));
  }

  steps.push({
    id: stepId++,
    description: `计算各类别得分：score(c) = \\sum_w \\text{TF-IDF}(w) \\times W_{c,w}。正面: ${classScores["正面"]?.toFixed(3) ?? "0"}，负面: ${classScores["负面"]?.toFixed(3) ?? "0"}，中性: ${classScores["中性"]?.toFixed(3) ?? "0"}`,
    data: { classScores },
    variables: { phase: "scoring", classScores, sample, tfidf: sample.tfidf },
  });

  const maxScore = Math.max(...Object.values(classScores));
  const expScores = Object.fromEntries(
    Object.entries(classScores).map(([k, v]) => [k, Math.exp(v - maxScore)])
  );
  const sumExp = Object.values(expScores).reduce((s, v) => s + v, 0);
  const probs = Object.fromEntries(
    Object.entries(expScores).map(([k, v]) => [k, Number((v / sumExp).toFixed(4))])
  );

  steps.push({
    id: stepId++,
    description: `Softmax 归一化得到概率分布：P(c | x) = \\frac{\\exp(s_c)}{\\sum_{c'} \\exp(s_{c'})}`,
    data: { probs },
    variables: { phase: "softmax", probs, classScores, sample },
  });

  const predictedLabel = Object.entries(probs).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const isCorrect = predictedLabel === sample.trueLabel;

  steps.push({
    id: stepId++,
    description: `预测类别：${predictedLabel}（置信度 ${probs[predictedLabel]?.toFixed(3) ?? "?"}），真实标签：${sample.trueLabel}，${isCorrect ? "✓ 分类正确" : "✗ 分类错误"}`,
    data: { predictedLabel, probs, isCorrect, finished: true },
    variables: {
      phase: "complete",
      predictedLabel,
      probs,
      classScores,
      isCorrect,
      sample,
      finished: true,
    },
  });

  return steps;
}
