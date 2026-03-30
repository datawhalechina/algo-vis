import { VisualizationStep } from "@/types";

export interface TopKState extends Record<string, unknown> {
  phase: string;
  /** 词表 token 列表 */
  vocab: string[];
  /** 模型输出原始 logits */
  logits: number[];
  /** temperature 缩放后的 logits */
  scaledLogits: number[];
  /** 全分布 softmax 概率（未截断） */
  fullProbs: number[];
  /** top-k 筛选后保留的索引（降序排列） */
  topKIndices: number[];
  /** top-k 截断后归一化的概率 */
  topKProbs: number[];
  /** 当前 k 值 */
  k: number;
  /** temperature */
  temperature: number;
  /** 采样命中的词汇索引（全局） */
  sampledIdx: number;
  /** 采样结果 token */
  sampledToken: string;
  /** 采样结果概率 */
  sampledProb: number;
  finished: boolean;
}

function softmax(logits: number[]): number[] {
  const maxV = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - maxV));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(6)));
}

/** LCG 伪随机，seed 决定结果可复现 */
function lcgRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateTopKSteps(
  vocab: string[],
  logits: number[],
  k: number,
  temperature: number,
  seed: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 防御性处理
  const safeVocab = vocab.length > 0 ? vocab : ["I", "am", "the", "a", "cat", "dog", "sat", "on"];
  const safeK = Math.max(1, Math.min(k, safeVocab.length));
  const safeT = Math.max(temperature, 0.01);

  // 若未提供足够 logits，伪造一组
  const rngLogit = lcgRand(seed + 1);
  const safeLogits =
    logits.length >= safeVocab.length
      ? logits.slice(0, safeVocab.length)
      : safeVocab.map((_, i) =>
          logits[i] !== undefined
            ? logits[i]
            : Number((rngLogit() * 8 - 4).toFixed(4))
        );

  const baseState = (): Omit<TopKState, "phase" | "finished"> => ({
    vocab: safeVocab,
    logits: safeLogits,
    scaledLogits: [],
    fullProbs: [],
    topKIndices: [],
    topKProbs: [],
    k: safeK,
    temperature: safeT,
    sampledIdx: -1,
    sampledToken: "",
    sampledProb: 0,
  });

  // ── Step 0：初始化 ────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `初始化：词表共 ${safeVocab.length} 个 token，k = ${safeK}，温度 T = ${safeT}。模型已输出 logits，即将执行 Top-k 采样流程：① 温度缩放 → ② 全分布 Softmax → ③ 取 Top-k → ④ 重归一化 → ⑤ 按概率采样。`,
    data: { logits: safeLogits, vocab: safeVocab },
    variables: {
      ...baseState(),
      phase: "init",
      finished: false,
    } as TopKState,
  });

  // ── Step 1：温度缩放 ──────────────────────────────────────────
  const scaledLogits = safeLogits.map((v) =>
    Number((v / safeT).toFixed(6))
  );
  steps.push({
    id: stepId++,
    description: `① 温度缩放：每个 logit 除以温度 T = ${safeT}。T 越小分布越尖锐（更确定），T 越大分布越平坦（更多样）。`,
    data: { scaledLogits },
    variables: {
      ...baseState(),
      phase: "temperature",
      scaledLogits,
      finished: false,
    } as TopKState,
  });

  // ── Step 2：全分布 Softmax ────────────────────────────────────
  const fullProbs = softmax(scaledLogits);
  steps.push({
    id: stepId++,
    description: `② 计算全分布 Softmax：将缩放后的 logits 转成概率分布（共 ${safeVocab.length} 个 token，概率之和 = 1）。此时所有 token 都有非零概率，包括低质量候选。`,
    data: { fullProbs },
    variables: {
      ...baseState(),
      phase: "softmax",
      scaledLogits,
      fullProbs,
      finished: false,
    } as TopKState,
  });

  // ── Step 3：取 Top-k ──────────────────────────────────────────
  // 按 fullProbs 降序排，取前 k 个的原始索引
  const sortedIndices = fullProbs
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p)
    .map((x) => x.i);
  const topKIndices = sortedIndices.slice(0, safeK);

  steps.push({
    id: stepId++,
    description: `③ 取 Top-k（k = ${safeK}）：保留概率最高的 ${safeK} 个 token，丢弃其余 ${safeVocab.length - safeK} 个候选（置为 0）。Top-k 候选：${topKIndices.map((i) => `"${safeVocab[i]}"`).join("、")}。`,
    data: { topKIndices },
    variables: {
      ...baseState(),
      phase: "topk",
      scaledLogits,
      fullProbs,
      topKIndices,
      finished: false,
    } as TopKState,
  });

  // ── Step 4：重归一化 ─────────────────────────────────────────
  const rawTopKProbs = topKIndices.map((i) => fullProbs[i] ?? 0);
  const topKSum = rawTopKProbs.reduce((a, b) => a + b, 0);
  // topKProbs 与 vocab 等长，非 top-k 位置为 0
  const topKProbs = safeVocab.map((_, i) =>
    topKIndices.includes(i)
      ? Number(((fullProbs[i] ?? 0) / topKSum).toFixed(6))
      : 0
  );

  steps.push({
    id: stepId++,
    description: `④ 重归一化：Top-k 候选的原始概率之和 = ${topKSum.toFixed(4)}，将其缩放至和为 1，得到新的概率分布（仅 ${safeK} 个 token 非零）。`,
    data: { topKProbs },
    variables: {
      ...baseState(),
      phase: "renormalize",
      scaledLogits,
      fullProbs,
      topKIndices,
      topKProbs,
      finished: false,
    } as TopKState,
  });

  // ── Step 5：按概率采样 ────────────────────────────────────────
  const rng = lcgRand(seed);
  const rand = rng();
  let cumsum = 0;
  let sampledIdx = topKIndices[topKIndices.length - 1] ?? 0;
  for (const idx of topKIndices) {
    cumsum += topKProbs[idx] ?? 0;
    if (rand <= cumsum) {
      sampledIdx = idx;
      break;
    }
  }
  const sampledToken = safeVocab[sampledIdx] ?? "<UNK>";
  const sampledProb = topKProbs[sampledIdx] ?? 0;

  steps.push({
    id: stepId++,
    description: `⑤ 按概率采样：生成随机数 u = ${rand.toFixed(4)}，按累积概率选取 token。采样结果："${sampledToken}"（重归一化后概率 = ${sampledProb.toFixed(4)}）。`,
    data: { sampledIdx, sampledToken, sampledProb },
    variables: {
      ...baseState(),
      phase: "sample",
      scaledLogits,
      fullProbs,
      topKIndices,
      topKProbs,
      sampledIdx,
      sampledToken,
      sampledProb,
      finished: false,
    } as TopKState,
  });

  // ── Step 6：完成 ─────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `采样完成！Top-k（k=${safeK}）将词表从 ${safeVocab.length} 个 token 截断到 ${safeK} 个，确保低质量 token 不被选中，同时保留 ${safeK} 个候选的多样性。最终选中 token："${sampledToken}"。`,
    data: { sampledToken, sampledProb },
    variables: {
      ...baseState(),
      phase: "complete",
      scaledLogits,
      fullProbs,
      topKIndices,
      topKProbs,
      sampledIdx,
      sampledToken,
      sampledProb,
      finished: true,
    } as TopKState,
  });

  return steps;
}
