import { VisualizationStep } from "@/types";

export interface SummarizationSentence {
  text: string;
  position: number;   // 0=first, higher=later
  tfScore: number;    // term frequency importance
  centralityScore: number; // sentence centrality
}

export interface SummarizationSample {
  title: string;
  sentences: SummarizationSentence[];
  maxSentences: number;
}

export const DEFAULT_SUMMARIZATION: SummarizationSample = {
  title: "人工智能发展现状",
  sentences: [
    { text: "人工智能（AI）正在改变各行各业的面貌。", position: 0, tfScore: 0.85, centralityScore: 0.90 },
    { text: "深度学习技术的突破推动了自然语言处理的飞速发展。", position: 1, tfScore: 0.78, centralityScore: 0.82 },
    { text: "ChatGPT 等大语言模型已被数百万用户广泛使用。", position: 2, tfScore: 0.72, centralityScore: 0.75 },
    { text: "然而，AI 的发展也带来了数据隐私和伦理挑战。", position: 3, tfScore: 0.65, centralityScore: 0.70 },
    { text: "研究人员正在积极探索可解释 AI 和负责任 AI 的方法。", position: 4, tfScore: 0.60, centralityScore: 0.65 },
  ],
  maxSentences: 2,
};

export function generateTextSummarizationSteps(sample: SummarizationSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { sentences, maxSentences, title } = sample;

  steps.push({
    id: stepId++,
    description: `初始化文本摘要：文章《${title}》共 ${sentences.length} 句话，目标提取最重要的 ${maxSentences} 句作为摘要（抽取式方法）。`,
    data: { sample },
    variables: { phase: "init", sample, sentences },
  });

  steps.push({
    id: stepId++,
    description: `抽取式摘要通过为每个句子打分来选择关键句。评分因素：\\text{score}(s) = w_1 \\cdot \\text{TF-IDF}(s) + w_2 \\cdot \\text{Centrality}(s) + w_3 \\cdot \\text{Position}(s)`,
    data: {},
    variables: { phase: "formula", sentences },
  });

  const scoredSentences = sentences.map((s) => {
    const posScore = 1.0 - s.position / sentences.length * 0.3;
    const totalScore = Number((0.4 * s.tfScore + 0.4 * s.centralityScore + 0.2 * posScore).toFixed(4));
    return { ...s, posScore: Number(posScore.toFixed(4)), totalScore };
  });

  for (let i = 0; i < scoredSentences.length; i++) {
    const s = scoredSentences[i];
    steps.push({
      id: stepId++,
      description: `句子 ${i + 1}：TF-IDF=${s.tfScore.toFixed(2)}，中心度=${s.centralityScore.toFixed(2)}，位置分=${s.posScore.toFixed(2)} → 综合分 = ${s.totalScore.toFixed(4)}`,
      data: { sentence: s },
      variables: {
        phase: "scoring",
        currentIdx: i,
        scoredSentences: scoredSentences.slice(0, i + 1),
        sentences,
      },
    });
  }

  const sorted = [...scoredSentences].sort((a, b) => b.totalScore - a.totalScore);
  const selected = sorted.slice(0, maxSentences).sort((a, b) => a.position - b.position);

  steps.push({
    id: stepId++,
    description: `按综合得分排序，选取得分最高的 ${maxSentences} 句：第1句（得分${sorted[0]?.totalScore.toFixed(3)}）、第${sorted[1]?.position !== undefined ? sorted[1].position + 1 : 2}句（得分${sorted[1]?.totalScore.toFixed(3)}）`,
    data: { sorted, selected },
    variables: { phase: "selection", sorted, selected, scoredSentences, sentences },
  });

  steps.push({
    id: stepId++,
    description: `摘要生成完成！提取了 ${selected.length} 句关键句作为摘要，压缩比 = ${(selected.length / sentences.length * 100).toFixed(0)}%。抽取式摘要保持原文表述，生成式摘要（如 BART、T5）则可重新组织语言。`,
    data: { selected, finished: true },
    variables: {
      phase: "complete",
      selected,
      sorted,
      scoredSentences,
      sentences,
      finished: true,
    },
  });

  return steps;
}
