import { VisualizationStep } from "@/types";

export interface TopPState extends Record<string, unknown> {
  phase: string;
  /** 词表 token 列表 */
  vocab: string[];
  /** 模型输出原始 logits */
  logits: number[];
  /** temperature 缩放后的 logits */
  scaledLogits: number[];
  /** 全分布 softmax 概率（按原始顺序） */
  fullProbs: number[];
  /** 按概率降序排列的索引 */
  sortedIndices: number[];
  /** 排序后的概率列表（降序） */
  sortedProbs: number[];
  /** 累积概率列表（与 sortedProbs 对应） */
  cumulativeProbs: number[];
  /** nucleus（核）内的原始索引列表 */
  nucleusIndices: number[];
  /** 重归一化后的概率（与 vocab 等长，非核内为 0） */
  nucleusProbs: number[];
  /** p 阈值 */
  p: number;
  /** temperature */
  temperature: number;
  /** 采样命中的词汇索引（全局） */
  sampledIdx: number;
  /** 采样结果 token */
  sampledToken: string;
  /** 采样结果的重归一化概率 */
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

export function generateTopPSteps(
  vocab: string[],
  logits: number[],
  p: number,
  temperature: number,
  seed: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 防御性处理
  const safeVocab = vocab.length > 0 ? vocab : ["I", "am", "the", "a", "cat", "dog", "sat", "on"];
  const safeP = Math.max(0.01, Math.min(p, 1.0));
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

  const baseState = (): Omit<TopPState, "phase" | "finished"> => ({
    vocab: safeVocab,
    logits: safeLogits,
    scaledLogits: [],
    fullProbs: [],
    sortedIndices: [],
    sortedProbs: [],
    cumulativeProbs: [],
    nucleusIndices: [],
    nucleusProbs: [],
    p: safeP,
    temperature: safeT,
    sampledIdx: -1,
    sampledToken: "",
    sampledProb: 0,
  });

  // ── Step 0：初始化 ────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `初始化：词表共 ${safeVocab.length} 个 token，p = ${safeP}，温度 T = ${safeT}。模型已输出 logits，即将执行 Top-p（Nucleus）采样：① 温度缩放 → ② 全分布 Softmax → ③ 按概率排序 → ④ 确定核集合 → ⑤ 重归一化 → ⑥ 采样。`,
    data: { logits: safeLogits, vocab: safeVocab },
    variables: {
      ...baseState(),
      phase: "init",
      finished: false,
    } as TopPState,
  });

  // ── Step 1：温度缩放 ──────────────────────────────────────────
  const scaledLogits = safeLogits.map((v) => Number((v / safeT).toFixed(6)));
  steps.push({
    id: stepId++,
    description: `① 温度缩放：每个 logit 除以温度 T = ${safeT}。T < 1 分布更尖锐（确定），T > 1 分布更平坦（随机）。`,
    data: { scaledLogits },
    variables: {
      ...baseState(),
      phase: "temperature",
      scaledLogits,
      finished: false,
    } as TopPState,
  });

  // ── Step 2：全分布 Softmax ────────────────────────────────────
  const fullProbs = softmax(scaledLogits);
  steps.push({
    id: stepId++,
    description: `② 全分布 Softmax：将缩放后的 logits 转为概率分布（共 ${safeVocab.length} 个 token，概率之和 = 1）。每个 token 都有非零概率。`,
    data: { fullProbs },
    variables: {
      ...baseState(),
      phase: "softmax",
      scaledLogits,
      fullProbs,
      finished: false,
    } as TopPState,
  });

  // ── Step 3：按概率降序排列 ────────────────────────────────────
  const sortedPairs = fullProbs
    .map((prob, i) => ({ prob, i }))
    .sort((a, b) => b.prob - a.prob);
  const sortedIndices = sortedPairs.map((x) => x.i);
  const sortedProbs = sortedPairs.map((x) => x.prob);

  steps.push({
    id: stepId++,
    description: `③ 按概率降序排列：将所有 token 从高概率到低概率排序，为累积计算做准备。最高概率："${safeVocab[sortedIndices[0]]}"（${sortedProbs[0].toFixed(4)}）。`,
    data: { sortedIndices, sortedProbs },
    variables: {
      ...baseState(),
      phase: "sort",
      scaledLogits,
      fullProbs,
      sortedIndices,
      sortedProbs,
      finished: false,
    } as TopPState,
  });

  // ── Step 4：计算累积概率，确定核集合 ──────────────────────────
  const cumulativeProbs: number[] = [];
  let cumsum = 0;
  const nucleusIndices: number[] = [];

  for (let rank = 0; rank < sortedProbs.length; rank++) {
    cumsum += sortedProbs[rank];
    cumulativeProbs.push(Number(cumsum.toFixed(6)));
    nucleusIndices.push(sortedIndices[rank]);
    // 累积概率超过 p 后，包含当前 token 并停止
    if (cumsum >= safeP) break;
  }

  steps.push({
    id: stepId++,
    description: `④ 确定核集合（Nucleus）：从高概率 token 开始累加，直到累积概率 ≥ p = ${safeP}。核内共 ${nucleusIndices.length} 个 token：${nucleusIndices.slice(0, 5).map((i) => `"${safeVocab[i]}"`).join("、")}${nucleusIndices.length > 5 ? `…等` : ""}。Top-p 的关键：概率分布集中时核较小，分散时核较大，自适应调整！`,
    data: { nucleusIndices, cumulativeProbs },
    variables: {
      ...baseState(),
      phase: "nucleus",
      scaledLogits,
      fullProbs,
      sortedIndices,
      sortedProbs,
      cumulativeProbs,
      nucleusIndices,
      finished: false,
    } as TopPState,
  });

  // ── Step 5：重归一化 ─────────────────────────────────────────
  const nucleusSum = nucleusIndices.reduce((s, i) => s + (fullProbs[i] ?? 0), 0);
  const nucleusProbs = safeVocab.map((_, i) =>
    nucleusIndices.includes(i)
      ? Number(((fullProbs[i] ?? 0) / nucleusSum).toFixed(6))
      : 0
  );

  steps.push({
    id: stepId++,
    description: `⑤ 重归一化：核集合概率之和 = ${nucleusSum.toFixed(4)}，将核内 token 的概率缩放至和为 1，非核内 token 概率置 0。`,
    data: { nucleusProbs },
    variables: {
      ...baseState(),
      phase: "renormalize",
      scaledLogits,
      fullProbs,
      sortedIndices,
      sortedProbs,
      cumulativeProbs,
      nucleusIndices,
      nucleusProbs,
      finished: false,
    } as TopPState,
  });

  // ── Step 6：按概率采样 ────────────────────────────────────────
  const rng = lcgRand(seed);
  const rand = rng();
  let sampledIdx = nucleusIndices[nucleusIndices.length - 1] ?? 0;
  let runningCum = 0;
  for (const idx of nucleusIndices) {
    runningCum += nucleusProbs[idx] ?? 0;
    if (rand <= runningCum) {
      sampledIdx = idx;
      break;
    }
  }
  const sampledToken = safeVocab[sampledIdx] ?? "<UNK>";
  const sampledProb = nucleusProbs[sampledIdx] ?? 0;

  steps.push({
    id: stepId++,
    description: `⑥ 按概率采样：随机数 u = ${rand.toFixed(4)}，从核集合中按累积概率采样。采样结果："${sampledToken}"（重归一化后概率 = ${sampledProb.toFixed(4)}）。`,
    data: { sampledIdx, sampledToken, sampledProb },
    variables: {
      ...baseState(),
      phase: "sample",
      scaledLogits,
      fullProbs,
      sortedIndices,
      sortedProbs,
      cumulativeProbs,
      nucleusIndices,
      nucleusProbs,
      sampledIdx,
      sampledToken,
      sampledProb,
      finished: false,
    } as TopPState,
  });

  // ── Step 7：完成 ─────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `采样完成！Top-p（p=${safeP}）动态选出 ${nucleusIndices.length} 个核 token（原始词表 ${safeVocab.length} 个），自适应调整候选数量，最终选中 token："${sampledToken}"。`,
    data: { sampledToken, sampledProb },
    variables: {
      ...baseState(),
      phase: "complete",
      scaledLogits,
      fullProbs,
      sortedIndices,
      sortedProbs,
      cumulativeProbs,
      nucleusIndices,
      nucleusProbs,
      sampledIdx,
      sampledToken,
      sampledProb,
      finished: true,
    } as TopPState,
  });

  return steps;
}
