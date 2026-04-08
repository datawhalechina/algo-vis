import { VisualizationStep } from "@/types";

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export interface CBOWToken {
  word: string;
  embedding: number[];
}

export const DEFAULT_CBOW_TOKENS: CBOWToken[] = [
  { word: "the",   embedding: [0.10, 0.20, 0.05, 0.15] },
  { word: "cat",   embedding: [0.80, 0.30, 0.60, 0.20] },
  { word: "sat",   embedding: [0.20, 0.75, 0.25, 0.65] },
  { word: "on",    embedding: [0.05, 0.10, 0.15, 0.08] },
  { word: "mat",   embedding: [0.75, 0.35, 0.55, 0.25] },
];

export function generateCBOWSteps(
  tokens: CBOWToken[],
  centerIdx: number,
  windowSize: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const n = tokens.length;
  const safeCenter = Math.max(0, Math.min(centerIdx, n - 1));
  const center = tokens[safeCenter];
  const dim = center.embedding.length;

  steps.push({
    id: stepId++,
    description: `初始化 CBOW：目标预测中心词 "${center.word}"（索引 ${safeCenter}），窗口大小 w=${windowSize}，维度 d=${dim}。目标：最大化 P(w_t | w_{t-w}, \\ldots, w_{t+w})`,
    data: { tokens, centerIdx: safeCenter, windowSize },
    variables: { phase: "init", tokens, centerIdx: safeCenter, windowSize, dim },
  });

  const contextIndices: number[] = [];
  for (let j = -windowSize; j <= windowSize; j++) {
    if (j === 0) continue;
    const idx = safeCenter + j;
    if (idx >= 0 && idx < n) contextIndices.push(idx);
  }

  steps.push({
    id: stepId++,
    description: `确定上下文窗口，共 ${contextIndices.length} 个上下文词：${contextIndices.map((i) => `"${tokens[i].word}"`).join(", ")}。CBOW 将这些上下文词的嵌入向量平均后预测中心词。`,
    data: { contextIndices },
    variables: { phase: "context", contextIndices, tokens, centerIdx: safeCenter, windowSize },
  });

  const contextEmbeddings = contextIndices.map((i) => tokens[i].embedding);
  const avgEmbedding = new Array(dim).fill(0).map((_, d) =>
    Number((contextEmbeddings.reduce((s, e) => s + e[d], 0) / contextEmbeddings.length).toFixed(4))
  );

  steps.push({
    id: stepId++,
    description: `对 ${contextIndices.length} 个上下文词的嵌入向量做平均：\\bar{v} = \\frac{1}{|C|} \\sum_{c \\in C} v_c = [${avgEmbedding.map((x) => x.toFixed(2)).join(", ")}]`,
    data: { contextEmbeddings, avgEmbedding },
    variables: { phase: "average", contextEmbeddings, avgEmbedding, contextIndices, tokens, centerIdx: safeCenter, windowSize },
  });

  const scores = tokens.map((t) =>
    Number(t.embedding.reduce((s, v, i) => s + v * avgEmbedding[i], 0).toFixed(4))
  );

  steps.push({
    id: stepId++,
    description: `用平均向量 \\bar{v} 与输出矩阵 W_{out} 的每行（词向量）做点积，得到各词得分`,
    data: { scores },
    variables: { phase: "scores", scores, avgEmbedding, contextIndices, tokens, centerIdx: safeCenter, windowSize },
  });

  const probs = softmax(scores);
  const centerProb = probs[safeCenter];

  steps.push({
    id: stepId++,
    description: `Softmax 归一化：P(w_t | \\text{context}) = \\frac{\\exp(\\bar{v} \\cdot u_{w_t})}{\\sum_w \\exp(\\bar{v} \\cdot u_w)}，预测中心词 "${center.word}" 的概率为 ${centerProb.toFixed(4)}`,
    data: { probs, centerProb },
    variables: { phase: "softmax", probs, centerProb, allProbs: tokens.map((t, i) => ({ word: t.word, prob: probs[i] })), scores, avgEmbedding, contextIndices, tokens, centerIdx: safeCenter, windowSize },
  });

  const loss = Number((-Math.log(Math.max(centerProb, 1e-10))).toFixed(4));

  steps.push({
    id: stepId++,
    description: `损失：\\mathcal{L} = -\\log P(w_{\\text{${center.word}}} | \\text{context}) = ${loss.toFixed(4)}。与 Skip-gram 相比，CBOW 训练更快，对高频词效果好，但低频词质量略低。`,
    data: { loss, finished: true },
    variables: {
      phase: "complete",
      loss,
      probs,
      centerProb,
      allProbs: tokens.map((t, i) => ({ word: t.word, prob: probs[i] })),
      avgEmbedding,
      contextIndices,
      tokens,
      centerIdx: safeCenter,
      windowSize,
      finished: true,
    },
  });

  return steps;
}
