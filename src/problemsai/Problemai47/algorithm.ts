import { VisualizationStep } from "@/types";

export interface DepToken {
  id: number;
  word: string;
  head: number;  // head token id, 0 = ROOT
  depRel: string;
  description: string;
}

export interface DepSample {
  sentence: string;
  tokens: DepToken[];
}

const DEP_COLORS: Record<string, string> = {
  ROOT:  "#6366f1",
  nsubj: "#3b82f6",
  dobj:  "#22c55e",
  prep:  "#f97316",
  pobj:  "#eab308",
  det:   "#94a3b8",
  amod:  "#ec4899",
  advmod:"#14b8a6",
};

export function getDepColor(rel: string): string {
  return DEP_COLORS[rel] ?? "#94a3b8";
}

export const DEFAULT_DEP_SAMPLES: DepSample[] = [
  {
    sentence: "The cat sat on the mat",
    tokens: [
      { id: 1, word: "The",  head: 2, depRel: "det",   description: "限定词修饰 cat" },
      { id: 2, word: "cat",  head: 3, depRel: "nsubj", description: "主语（cat 是 sat 的主语）" },
      { id: 3, word: "sat",  head: 0, depRel: "ROOT",  description: "根节点（谓语动词）" },
      { id: 4, word: "on",   head: 3, depRel: "prep",  description: "介词修饰 sat" },
      { id: 5, word: "the",  head: 6, depRel: "det",   description: "限定词修饰 mat" },
      { id: 6, word: "mat",  head: 4, depRel: "pobj",  description: "介词宾语（on 的宾语是 mat）" },
    ],
  },
  {
    sentence: "She loves beautiful music",
    tokens: [
      { id: 1, word: "She",       head: 2, depRel: "nsubj", description: "主语" },
      { id: 2, word: "loves",     head: 0, depRel: "ROOT",  description: "根节点（谓语）" },
      { id: 3, word: "beautiful", head: 4, depRel: "amod",  description: "形容词修饰 music" },
      { id: 4, word: "music",     head: 2, depRel: "dobj",  description: "宾语（loves 的宾语是 music）" },
    ],
  },
];

export function generateDependencyParsingSteps(sample: DepSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { sentence, tokens } = sample;

  steps.push({
    id: stepId++,
    description: `初始化依存句法分析：输入句子 "${sentence}"，共 ${tokens.length} 个词语。目标：为每个词语找到其中心词（head）和依存关系（depRel），构建依存树。`,
    data: { sentence, tokens },
    variables: { phase: "init", sentence, tokens },
  });

  steps.push({
    id: stepId++,
    description: `依存句法树的核心性质：① 树只有一个根（ROOT）② 每个词只有一个中心词 ③ 不存在环路。形式化：对每个 w_i，存在唯一 head(w_i) 使得 (head(w_i), w_i, rel) \\in \\text{arcs}`,
    data: {},
    variables: { phase: "intro", sentence, tokens },
  });

  const parsedArcs: DepToken[] = [];
  const rootToken = tokens.find((t) => t.depRel === "ROOT");

  if (rootToken) {
    parsedArcs.push(rootToken);
    steps.push({
      id: stepId++,
      description: `首先识别根节点（ROOT）："${rootToken.word}"（${rootToken.description}）。根节点是句子的谓语核心，其 head = 0。`,
      data: { rootToken },
      variables: { phase: "root", rootToken, parsedArcs: [...parsedArcs], tokens, sentence },
    });
  }

  const nonRoot = tokens.filter((t) => t.depRel !== "ROOT").sort((a, b) => {
    const relOrder = ["nsubj", "dobj", "det", "amod", "advmod", "prep", "pobj"];
    return relOrder.indexOf(a.depRel) - relOrder.indexOf(b.depRel);
  });

  for (let i = 0; i < nonRoot.length; i++) {
    const t = nonRoot[i];
    const headToken = tokens.find((h) => h.id === t.head);
    parsedArcs.push(t);
    steps.push({
      id: stepId++,
      description: `添加依存弧 ${i + 2}/${tokens.length}："${t.word}" →(${t.depRel})→ "${headToken?.word ?? "ROOT"}"。${t.description}`,
      data: { token: t, headToken },
      variables: {
        phase: "parsing",
        currentIdx: i,
        currentToken: t,
        headToken,
        parsedArcs: [...parsedArcs],
        tokens,
        sentence,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `依存树构建完成！句子 "${sentence}" 的依存结构：${tokens.map((t) => `${t.word}(${t.depRel})`).join(" → ")}。依存分析揭示了词语间的语法关系，是问答和信息抽取的基础。`,
    data: { finished: true },
    variables: {
      phase: "complete",
      parsedArcs: [...tokens],
      tokens,
      sentence,
      finished: true,
    },
  });

  return steps;
}
