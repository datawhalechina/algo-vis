import { VisualizationStep } from "@/types";

export type POSTag = "DT" | "NN" | "VBD" | "IN" | "JJ" | "RB" | "PRP" | "VBZ" | "NNP";

export interface POSToken {
  word: string;
  tag: POSTag | string;
  description: string;
  confidence: number;
  color: string;
}

export interface POSSample {
  sentence: string;
  tokens: POSToken[];
}

export const DEFAULT_POS_SAMPLES: POSSample[] = [
  {
    sentence: "The cat sat on the mat",
    tokens: [
      { word: "The",  tag: "DT",  description: "限定词",       confidence: 0.99, color: "#60a5fa" },
      { word: "cat",  tag: "NN",  description: "名词（单数）",  confidence: 0.97, color: "#f97316" },
      { word: "sat",  tag: "VBD", description: "动词（过去式）", confidence: 0.95, color: "#22c55e" },
      { word: "on",   tag: "IN",  description: "介词",          confidence: 0.98, color: "#a78bfa" },
      { word: "the",  tag: "DT",  description: "限定词",        confidence: 0.99, color: "#60a5fa" },
      { word: "mat",  tag: "NN",  description: "名词（单数）",  confidence: 0.93, color: "#f97316" },
    ],
  },
  {
    sentence: "She runs very quickly",
    tokens: [
      { word: "She",    tag: "PRP", description: "人称代词",   confidence: 0.99, color: "#14b8a6" },
      { word: "runs",   tag: "VBZ", description: "动词（三单）", confidence: 0.96, color: "#22c55e" },
      { word: "very",   tag: "RB",  description: "副词",       confidence: 0.94, color: "#ec4899" },
      { word: "quickly",tag: "RB",  description: "副词",       confidence: 0.97, color: "#ec4899" },
    ],
  },
];

export function generatePOSTaggingSteps(sample: POSSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { sentence, tokens } = sample;

  steps.push({
    id: stepId++,
    description: `初始化词性标注（POS Tagging）：输入句子 "${sentence}"，共 ${tokens.length} 个词语。使用 Penn Treebank 词性标签集，为每个词分配词性。`,
    data: { sentence, tokens },
    variables: { phase: "init", sentence, tokens },
  });

  steps.push({
    id: stepId++,
    description: `词性标注是序列标注任务：P(t_1, \\ldots, t_n | w_1, \\ldots, w_n) = \\prod_{i=1}^n P(t_i | w_i, \\text{context})。常用模型：HMM、BiLSTM-CRF、BERT。`,
    data: {},
    variables: { phase: "formula", sentence, tokens },
  });

  const taggedTokens: POSToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    taggedTokens.push(t);
    steps.push({
      id: stepId++,
      description: `标注词 ${i + 1}/${tokens.length}："${t.word}" → ${t.tag}（${t.description}），置信度 ${t.confidence.toFixed(2)}`,
      data: { token: t },
      variables: {
        phase: "tagging",
        currentIdx: i,
        taggedTokens: [...taggedTokens],
        tokens,
        sentence,
      },
    });
  }

  const tagCounts = tokens.reduce((acc, t) => {
    acc[t.tag] = (acc[t.tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  steps.push({
    id: stepId++,
    description: `词性标注完成！统计：${Object.entries(tagCounts).map(([tag, count]) => `${tag}×${count}`).join("、")}。词性信息是句法分析、语义角色标注等下游任务的重要输入。`,
    data: { tagCounts, finished: true },
    variables: {
      phase: "complete",
      taggedTokens,
      tagCounts,
      tokens,
      sentence,
      finished: true,
    },
  });

  return steps;
}
