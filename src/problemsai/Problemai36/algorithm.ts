import { VisualizationStep } from "@/types";

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

function dotProduct(a: number[], b: number[]): number {
  return Number(a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0).toFixed(4));
}

export interface SkipGramToken {
  word: string;
  embedding: number[];
}

export const DEFAULT_TOKENS: SkipGramToken[] = [
  { word: "the",   embedding: [0.10, 0.20, 0.05, 0.15] },
  { word: "cat",   embedding: [0.80, 0.30, 0.60, 0.20] },
  { word: "sat",   embedding: [0.20, 0.75, 0.25, 0.65] },
  { word: "on",    embedding: [0.05, 0.10, 0.15, 0.08] },
  { word: "mat",   embedding: [0.75, 0.35, 0.55, 0.25] },
];

export function generateSkipGramSteps(
  tokens: SkipGramToken[],
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
    description: `初始化 Skip-gram：中心词 "${center.word}"（索引 ${safeCenter}），窗口大小 w=${windowSize}，嵌入维度 d=${dim}。目标：最大化 \\sum_{-w \\leq j \\leq w, j \\neq 0} \\log P(w_{t+j} | w_t)`,
    data: { tokens, centerIdx: safeCenter, windowSize },
    variables: { phase: "init", tokens, centerIdx: safeCenter, windowSize, dim },
  });

  steps.push({
    id: stepId++,
    description: `取中心词 "${center.word}" 的嵌入向量 v_{\\text{${center.word}}} = [${center.embedding.map((x) => x.toFixed(2)).join(", ")}]（来自输入矩阵 W_{in}）`,
    data: { center },
    variables: { phase: "center", center, centerIdx: safeCenter, tokens, windowSize },
  });

  const contextIndices: number[] = [];
  for (let j = -windowSize; j <= windowSize; j++) {
    if (j === 0) continue;
    const idx = safeCenter + j;
    if (idx >= 0 && idx < n) contextIndices.push(idx);
  }

  steps.push({
    id: stepId++,
    description: `确定上下文窗口 [-${windowSize}, +${windowSize}]，共 ${contextIndices.length} 个上下文词：${contextIndices.map((i) => `"${tokens[i].word}"`).join(", ")}`,
    data: { contextIndices },
    variables: { phase: "window", contextIndices, center, centerIdx: safeCenter, tokens, windowSize },
  });

  const scores: Array<{ word: string; score: number; prob: number; isContext: boolean }> = [];

  for (const ci of contextIndices) {
    const ctx = tokens[ci];
    const score = dotProduct(center.embedding, ctx.embedding);
    const isContext = contextIndices.includes(ci);

    steps.push({
      id: stepId++,
      description: `计算中心词 "${center.word}" 与上下文词 "${ctx.word}" 的得分：score = v_{\\text{${center.word}}} \\cdot u_{\\text{${ctx.word}}} = ${score}`,
      data: { center, context: ctx, score },
      variables: {
        phase: "scoring",
        currentContextIdx: ci,
        center,
        tokens,
        centerIdx: safeCenter,
        windowSize,
        contextIndices,
        scores: [...scores, { word: ctx.word, score, prob: 0, isContext }],
      },
    });
    scores.push({ word: ctx.word, score, prob: 0, isContext });
  }

  const allScores = tokens.map((t) => dotProduct(center.embedding, t.embedding));
  const probs = softmax(allScores);

  const contextProbs = contextIndices.map((ci) => ({
    word: tokens[ci].word,
    prob: probs[ci],
  }));

  steps.push({
    id: stepId++,
    description: `对所有词语得分应用 Softmax：P(w_O | w_I) = \\frac{\\exp(v_{w_O}^\\top v_{w_I})}{\\sum_{w=1}^{|V|} \\exp(v_w^\\top v_{w_I})}，计算上下文词概率`,
    data: { probs, contextProbs },
    variables: {
      phase: "softmax",
      probs,
      contextProbs,
      allProbs: tokens.map((t, i) => ({ word: t.word, prob: probs[i] })),
      center,
      tokens,
      centerIdx: safeCenter,
      windowSize,
      contextIndices,
    },
  });

  const loss = -contextProbs.reduce((s, { prob }) => s + Math.log(Math.max(prob, 1e-10)), 0);
  const normLoss = Number((loss / contextProbs.length).toFixed(4));

  steps.push({
    id: stepId++,
    description: `计算损失：\\mathcal{L} = -\\frac{1}{|C|} \\sum_{c \\in C} \\log P(w_c | w_{\\text{${center.word}}}) = ${normLoss.toFixed(4)}。反向传播更新嵌入矩阵以最小化该损失。`,
    data: { loss: normLoss, contextProbs, finished: true },
    variables: {
      phase: "complete",
      loss: normLoss,
      contextProbs,
      allProbs: tokens.map((t, i) => ({ word: t.word, prob: probs[i] })),
      center,
      tokens,
      centerIdx: safeCenter,
      windowSize,
      contextIndices,
      finished: true,
    },
  });

  return steps;
}
