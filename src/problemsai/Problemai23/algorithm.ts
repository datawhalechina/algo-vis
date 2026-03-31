import { VisualizationStep } from "@/types";

function initWeight(rows: number, cols: number, seed: number): number[][] {
  const W: number[][] = [];
  let x = seed;
  const next = () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return (x / 0xffffffff) * 2 - 1;
  };
  for (let i = 0; i < rows; i++) {
    W.push([]);
    for (let j = 0; j < cols; j++) {
      W[i].push(Number((next() * Math.sqrt(2 / (rows + cols))).toFixed(4)));
    }
  }
  return W;
}

function round4v(v: number): number {
  return Number(v.toFixed(4));
}

export interface KVCacheEntry {
  key: number[];
  value: number[];
}

export interface GenerationStep {
  tokenIdx: number;
  newToken: string;
  cacheSize: number;
  computationFlops: number;
  newKV: { k: number[]; v: number[] };
}

export function generateKVCacheSteps(
  promptLen: number,
  genSteps: number,
  dHead: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let id = 0;

  const TOKENS = ["The", "cat", "sat", "on", "mat", "and", "slept", "well", "today", "night", "very", "much"];
  const promptTokens = TOKENS.slice(0, promptLen);
  const genTokens = TOKENS.slice(promptLen, promptLen + genSteps);

  steps.push({
    id: id++,
    description: `初始化：prompt 包含 ${promptLen} 个 token：[${promptTokens.join(', ')}]。KV 缓存将存储每层每个 token 的 Key 和 Value 向量，避免在生成时重复计算。`,
    data: {},
    variables: {
      phase: "init",
      promptTokens, genTokens, promptLen, genSteps, dHead,
    },
  });

  // Prefill: compute KV for all prompt tokens
  const kvCache: { key: number[]; value: number[] }[] = [];
  for (let t = 0; t < promptLen; t++) {
    const k = initWeight(1, dHead, 100 + t * 13)[0];
    const v = initWeight(1, dHead, 200 + t * 17)[0];
    kvCache.push({ key: k, value: v });
  }

  const prefillFlops = promptLen * promptLen * dHead;

  steps.push({
    id: id++,
    description: `预填充（Prefill）：一次性为所有 ${promptLen} 个 prompt token 计算 K、V，存入缓存。计算量 O(N²) = O(${promptLen}² × ${dHead}) ≈ ${prefillFlops} flops。`,
    data: {},
    variables: {
      phase: "prefill",
      promptTokens,
      kvCache: kvCache.map((e) => ({ k: e.key.slice(0, 4), v: e.value.slice(0, 4) })),
      cacheSize: promptLen,
      prefillFlops,
      promptLen, genSteps, dHead,
    },
  });

  // Generate tokens one by one, showing KV cache growing
  const generationSteps: GenerationStep[] = [];
  for (let s = 0; s < genSteps; s++) {
    const totalSeqLen = promptLen + s;
    const newK = initWeight(1, dHead, 300 + s * 19)[0];
    const newV = initWeight(1, dHead, 400 + s * 23)[0];
    kvCache.push({ key: newK, value: newV });

    const withCacheFlops = (totalSeqLen + 1) * dHead;  // Only compute new token's attention
    const withoutCacheFlops = (totalSeqLen + 1) * (totalSeqLen + 1) * dHead;  // Full recompute
    const speedup = round4v(withoutCacheFlops / withCacheFlops);

    generationSteps.push({
      tokenIdx: promptLen + s,
      newToken: genTokens[s] ?? `tok${s}`,
      cacheSize: promptLen + s + 1,
      computationFlops: withCacheFlops,
      newKV: { k: newK.slice(0, 4), v: newV.slice(0, 4) },
    });

    steps.push({
      id: id++,
      description: `生成步骤 ${s + 1}：新 token "${genTokens[s] ?? `tok${s}`}"（位置 ${totalSeqLen}）只需计算自己的 K、V，然后与缓存中 ${totalSeqLen} 个 K/V 做注意力。计算量 O(N) 而非 O(N²)，加速 ${speedup}×。`,
      data: {},
      variables: {
        phase: `gen_step_${s + 1}`,
        promptTokens,
        allTokens: [...promptTokens, ...genTokens.slice(0, s + 1)],
        kvCache: kvCache.map((e) => ({ k: e.key.slice(0, 4), v: e.value.slice(0, 4) })),
        cacheSize: promptLen + s + 1,
        withCacheFlops,
        withoutCacheFlops,
        speedup,
        generationSteps: generationSteps.slice(),
        promptLen, genSteps, dHead,
      },
    });
  }

  // Summary
  const totalWithCache = promptLen * promptLen * dHead + genSteps * (promptLen + genSteps / 2) * dHead;
  const totalWithoutCache = Array.from({ length: genSteps }, (_, s) =>
    (promptLen + s + 1) ** 2 * dHead
  ).reduce((a, b) => a + b, promptLen * promptLen * dHead);

  steps.push({
    id: id++,
    description: `KV 缓存完成！总计节省约 ${Math.round((1 - totalWithCache / totalWithoutCache) * 100)}% 计算量。代价：内存占用 = layers × heads × seq_len × d_head × 2（K+V）× dtype，长序列时需要专门的缓存管理策略。`,
    data: { finished: true },
    variables: {
      phase: "done",
      promptTokens, genTokens,
      totalWithCache, totalWithoutCache,
      savingRatio: round4v(1 - totalWithCache / totalWithoutCache),
      cacheSize: promptLen + genSteps,
      promptLen, genSteps, dHead, finished: true,
    },
  });

  return steps;
}
