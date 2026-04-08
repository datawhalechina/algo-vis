import { VisualizationStep } from "@/types";

export type EntityType = "PERSON" | "LOCATION" | "ORGANIZATION" | "O";

export interface NERToken {
  word: string;
  bioTag: string;
  entityType: EntityType;
  confidence: number;
}

export interface NERSample {
  text: string;
  tokens: NERToken[];
}

export const DEFAULT_NER_SAMPLES: NERSample[] = [
  {
    text: "苹果公司位于加利福尼亚州库比蒂诺",
    tokens: [
      { word: "苹果", bioTag: "B-ORG", entityType: "ORGANIZATION", confidence: 0.92 },
      { word: "公司", bioTag: "I-ORG", entityType: "ORGANIZATION", confidence: 0.89 },
      { word: "位于", bioTag: "O", entityType: "O", confidence: 0.97 },
      { word: "加利福尼亚州", bioTag: "B-LOC", entityType: "LOCATION", confidence: 0.95 },
      { word: "库比蒂诺", bioTag: "B-LOC", entityType: "LOCATION", confidence: 0.88 },
    ],
  },
  {
    text: "马云创立了阿里巴巴",
    tokens: [
      { word: "马云", bioTag: "B-PER", entityType: "PERSON", confidence: 0.98 },
      { word: "创立", bioTag: "O", entityType: "O", confidence: 0.99 },
      { word: "了", bioTag: "O", entityType: "O", confidence: 0.99 },
      { word: "阿里巴巴", bioTag: "B-ORG", entityType: "ORGANIZATION", confidence: 0.96 },
    ],
  },
];

export function generateNERSteps(sample: NERSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { text, tokens } = sample;

  steps.push({
    id: stepId++,
    description: `初始化 NER：输入文本 "${text}"，分词为 ${tokens.length} 个词语。使用 BIO 标注体系：B=实体开始，I=实体内部，O=非实体`,
    data: { text, tokens },
    variables: { phase: "init", text, tokens },
  });

  const taggedTokens: NERToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    taggedTokens.push(t);
    const tagDesc = t.bioTag === "O"
      ? `词语 "${t.word}" 标注为 O（非实体），置信度 ${t.confidence.toFixed(2)}`
      : `词语 "${t.word}" 标注为 ${t.bioTag}（${t.entityType}），置信度 ${t.confidence.toFixed(2)}`;
    steps.push({
      id: stepId++,
      description: `序列标注步骤 ${i + 1}/${tokens.length}：${tagDesc}`,
      data: { token: t, taggedSoFar: [...taggedTokens] },
      variables: {
        phase: "tagging",
        currentIdx: i,
        taggedTokens: [...taggedTokens],
        tokens,
        text,
      },
    });
  }

  const entities: Array<{ text: string; type: EntityType; tokens: string[] }> = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.bioTag.startsWith("B-")) {
      const entityTokens = [t.word];
      let j = i + 1;
      while (j < tokens.length && tokens[j].bioTag.startsWith("I-")) {
        entityTokens.push(tokens[j].word);
        j++;
      }
      entities.push({ text: entityTokens.join(""), type: t.entityType, tokens: entityTokens });
      i = j;
    } else {
      i++;
    }
  }

  steps.push({
    id: stepId++,
    description: `合并 BIO 标注，识别出 ${entities.length} 个命名实体：${entities.map((e) => `"${e.text}"(${e.type})`).join("、")}`,
    data: { entities },
    variables: { phase: "merge", entities, taggedTokens, tokens, text },
  });

  steps.push({
    id: stepId++,
    description: `NER 完成！识别实体：${entities.map((e) => `[${e.text}/${e.type}]`).join(" ")}。BIO 标注体系使连续词语构成的实体可被正确合并。`,
    data: { entities, finished: true },
    variables: { phase: "complete", entities, taggedTokens, tokens, text, finished: true },
  });

  return steps;
}
