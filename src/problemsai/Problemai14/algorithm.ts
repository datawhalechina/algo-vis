import { VisualizationStep } from "@/types";

export interface TemperatureState extends Record<string, unknown> {
  phase: string;
  /** 词表 token 列表 */
  vocab: string[];
  /** 模型输出原始 logits */
  logits: number[];
  /** temperature 缩放后的 logits */
  scaledLogits: number[];
  /** 原始 Softmax 概率（temperature=1） */
  baseProbs: number[];
  /** 温度缩放后的 Softmax 概率 */
  scaledProbs: number[];
  /** 当前温度值 */
  temperature: number;
  /** 分布熵（衡量随机性）：H = -sum(p * log(p)) */
  entropy: number;
  /** 最高概率 token 的索引 */
  argmaxIdx: number;
  /** 采样结果索引 */
  sampledIdx: number;
  /** 采样结果 token */
  sampledToken: string;
  /** 采样结果概率 */
  sampledProb: number;
  /** 随机数 */
  randVal: number;
  finished: boolean;
}

function softmax(logits: number[]): number[] {
  const maxV = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - maxV));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(6)));
}

function calcEntropy(probs: number[]): number {
  const h = probs.reduce((acc, p) => {
    if (p <= 0) return acc;
    return acc - p * Math.log(p);
  }, 0);
  return Number(h.toFixed(4));
}

/** LCG 伪随机，seed 决定结果可复现 */
function lcgRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateTemperatureSamplingSteps(
  vocab: string[],
  logits: number[],
  temperature: number,
  seed: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 防御性处理
  const safeVocab = vocab.length > 0 ? vocab : ["I", "am", "a", "cat", "dog", "sat", "the", "on"];
  const safeT = Math.max(temperature, 0.01);

  // 若未提供足够 logits，伪造一组
  const rngLogit = lcgRand(seed + 1);
  const safeLogits: number[] =
    logits.length >= safeVocab.length
      ? logits.slice(0, safeVocab.length)
      : safeVocab.map((_, i) =>
          logits[i] !== undefined
            ? logits[i]
            : Number((rngLogit() * 8 - 4).toFixed(4))
        );

  // 预先计算所有数值
  const scaledLogits = safeLogits.map((v) => Number((v / safeT).toFixed(6)));
  const baseProbs = softmax(safeLogits);          // T=1 时的基准分布
  const scaledProbs = softmax(scaledLogits);       // 温度缩放后的分布

  const baseEntropy = calcEntropy(baseProbs);
  const scaledEntropy = calcEntropy(scaledProbs);

  const argmaxIdx = scaledProbs.reduce(
    (maxIdx, p, i) => (p > scaledProbs[maxIdx] ? i : maxIdx),
    0
  );

  // 采样
  const rng = lcgRand(seed);
  const randVal = rng();
  let sampledIdx = safeVocab.length - 1;
  let cumsum = 0;
  for (let i = 0; i < scaledProbs.length; i++) {
    cumsum += scaledProbs[i];
    if (randVal <= cumsum) {
      sampledIdx = i;
      break;
    }
  }
  const sampledToken = safeVocab[sampledIdx] ?? "<UNK>";
  const sampledProb = scaledProbs[sampledIdx] ?? 0;

  const baseState = (): Omit<TemperatureState, "phase" | "finished"> => ({
    vocab: safeVocab,
    logits: safeLogits,
    scaledLogits: [],
    baseProbs: [],
    scaledProbs: [],
    temperature: safeT,
    entropy: 0,
    argmaxIdx,
    sampledIdx: -1,
    sampledToken: "",
    sampledProb: 0,
    randVal,
  });

  // ── Step 0：初始化 ────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `初始化：词表共 ${safeVocab.length} 个 token，温度 T = ${safeT}。模型已输出原始 logits，即将通过温度采样控制生成的随机性。流程：① 温度缩放 → ② Softmax → ③ 采样。`,
    data: { logits: safeLogits, vocab: safeVocab },
    variables: {
      ...baseState(),
      phase: "init",
      finished: false,
    } as TemperatureState,
  });

  // ── Step 1：温度缩放 ──────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `① 温度缩放：每个 logit 除以温度 T = ${safeT}。${safeT < 1 ? "T < 1，logit 差异被放大，分布将更尖锐（更确定）。" : safeT > 1 ? "T > 1，logit 差异被压缩，分布将更平坦（更随机）。" : "T = 1，logit 保持不变。"}`,
    data: { scaledLogits },
    variables: {
      ...baseState(),
      phase: "temperature",
      scaledLogits,
      finished: false,
    } as TemperatureState,
  });

  // ── Step 2：Softmax（缩放后）────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `② Softmax：将缩放后的 logits 转为概率分布。熵 H = ${scaledEntropy}（${scaledEntropy < baseEntropy ? `低于基准熵 ${baseEntropy}，分布更集中` : `高于基准熵 ${baseEntropy}，分布更均匀`}）。`,
    data: { scaledProbs },
    variables: {
      ...baseState(),
      phase: "softmax",
      scaledLogits,
      baseProbs,
      scaledProbs,
      entropy: scaledEntropy,
      finished: false,
    } as TemperatureState,
  });

  // ── Step 3：采样 ─────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `③ 按概率采样：随机数 u = ${randVal.toFixed(4)}，按概率分布采样。采样结果："${sampledToken}"（概率 = ${sampledProb.toFixed(4)}）。`,
    data: { sampledIdx, sampledToken, sampledProb },
    variables: {
      ...baseState(),
      phase: "sample",
      scaledLogits,
      baseProbs,
      scaledProbs,
      entropy: scaledEntropy,
      sampledIdx,
      sampledToken,
      sampledProb,
      finished: false,
    } as TemperatureState,
  });

  // ── Step 4：完成 ─────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `采样完成！温度 T = ${safeT}，分布熵 = ${scaledEntropy}（基准熵 = ${baseEntropy}），最终采样 token："${sampledToken}"（概率 = ${sampledProb.toFixed(4)}）。`,
    data: { sampledToken, sampledProb, entropy: scaledEntropy },
    variables: {
      ...baseState(),
      phase: "complete",
      scaledLogits,
      baseProbs,
      scaledProbs,
      entropy: scaledEntropy,
      sampledIdx,
      sampledToken,
      sampledProb,
      finished: true,
    } as TemperatureState,
  });

  return steps;
}
