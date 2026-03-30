import { VisualizationStep } from "@/types";

// ── 类型定义 ──────────────────────────────────────────────────────

/** 单条 beam 候选序列 */
export interface Beam {
  tokens: string[];      // 已生成的 token 序列
  logProb: number;       // 累积 log 概率（未归一化）
  normScore: number;     // 长度惩罚后的归一化分数
  isFinished: boolean;   // 是否遇到 EOS
}

/** 单次扩展的候选项 */
export interface Candidate {
  parentBeamIdx: number; // 来自哪个 beam
  token: string;         // 扩展的新 token
  tokenLogProb: number;  // 该 token 的 log 概率
  newLogProb: number;    // 新累积 log 概率
  newNormScore: number;  // 新归一化分数
}

export interface BeamSearchState extends Record<string, unknown> {
  phase: string;
  step: number;           // 当前生成步
  maxSteps: number;
  beamWidth: number;
  vocab: string[];
  /** 每个 vocab token 的 log 概率表（step → beamIdx → token → logProb） */
  logProbTable: number[][];   // beamWidth × vocabSize，当前步的 logit 分布
  /** 当前存活的 beam 列表 */
  beams: Beam[];
  /** 当前步所有扩展候选（扁平列表） */
  candidates: Candidate[];
  /** 当前步选中的 top-beamWidth 候选 */
  selectedCandidates: Candidate[];
  /** 最终完成的序列（按分数排序） */
  finishedBeams: Beam[];
  /** 贪心结果（对比用） */
  greedyTokens: string[];
  finished: boolean;
  alphaLenPenalty: number;
}

// ── 工具函数 ──────────────────────────────────────────────────────

/** log-sum-exp 归一化 → softmax in log space */
function logSoftmax(logits: number[]): number[] {
  const maxV = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - maxV));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  return logits.map((v) => v - maxV - Math.log(sumExp));
}

/** 长度惩罚（Google NMT 公式） */
function lengthPenalty(len: number, alpha: number): number {
  return Math.pow((5 + len) / 6, alpha);
}

/** 伪随机种子 LCG */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ── 主生成函数 ────────────────────────────────────────────────────

/**
 * 生成束搜索的可视化步骤。
 * @param vocabStr   逗号分隔的词汇表，最后一项视为 EOS
 * @param beamWidth  束宽
 * @param maxSteps   最大生成步数
 * @param alpha      长度惩罚系数（0 = 不惩罚）
 * @param seed       随机种子（用于生成伪 logit）
 */
export function generateBeamSearchSteps(
  vocabStr: string,
  beamWidth: number,
  maxSteps: number,
  alpha: number,
  seed: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const vocab = vocabStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (vocab.length < 2) vocab.push(...["cat", "sat", "on", "<EOS>"]);
  const EOS = vocab[vocab.length - 1];
  const safeBeamWidth = Math.max(1, Math.min(beamWidth, 4));
  const safeMaxSteps = Math.max(1, Math.min(maxSteps, 6));
  const safeAlpha = Math.max(0, Math.min(alpha, 1));
  // 初始化：单条空序列，score=0
  let activeBeams: Beam[] = [
    { tokens: [], logProb: 0, normScore: 0, isFinished: false },
  ];
  const finishedBeams: Beam[] = [];

  // 贪心对比序列（每步选最大概率 token）
  const greedyTokens: string[] = [];

  // 辅助：生成一组伪 logit（beamWidth × vocabSize）
  function makeLogProbTable(step: number): number[][] {
    // 不同 beam/step 有不同分布，模拟真实语言模型
    return Array.from({ length: safeBeamWidth }, (_, bi) => {
      const r = lcg(seed + step * 31 + bi * 97);
      const logits = vocab.map((tok) => {
        // EOS 在后期步骤概率更高
        const eosBoost = tok === EOS ? (step >= safeMaxSteps - 1 ? 2.0 : -1.0) : 0;
        return Number((r() * 4 - 2 + eosBoost).toFixed(4));
      });
      return logSoftmax(logits).map((v) => Number(v.toFixed(4)));
    });
  }

  // ── Step 0：初始化 ──────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `初始化束搜索：束宽 B = ${safeBeamWidth}，最大步数 = ${safeMaxSteps}，词表大小 = ${vocab.length}，长度惩罚 α = ${safeAlpha}。从空序列出发，每步保留 log 分数最高的 B 条路径。`,
    data: {},
    variables: {
      phase: "init",
      step: 0,
      maxSteps: safeMaxSteps,
      beamWidth: safeBeamWidth,
      vocab,
      logProbTable: [],
      beams: activeBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
      candidates: [],
      selectedCandidates: [],
      finishedBeams: [],
      greedyTokens: [],
      finished: false,
      alphaLenPenalty: safeAlpha,
    } as BeamSearchState,
  });

  // ── 主循环 ─────────────────────────────────────────────────────
  for (let step = 0; step < safeMaxSteps; step++) {
    if (activeBeams.length === 0) break;

    const logProbTable = makeLogProbTable(step);

    // ── Step A：展示当前 beam + 即将扩展 ─────────────────────────
    steps.push({
      id: stepId++,
      description: `第 ${step + 1} 步 · 扩展阶段：将 ${activeBeams.length} 条活跃 beam 各自扩展 ${vocab.length} 个 token，共产生 ${activeBeams.length * vocab.length} 个候选。`,
      data: {},
      variables: {
        phase: "expand",
        step: step + 1,
        maxSteps: safeMaxSteps,
        beamWidth: safeBeamWidth,
        vocab,
        logProbTable,
        beams: activeBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
        candidates: [],
        selectedCandidates: [],
        finishedBeams: finishedBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
        greedyTokens: [...greedyTokens],
        finished: false,
        alphaLenPenalty: safeAlpha,
      } as BeamSearchState,
    });

    // 计算所有候选
    const allCandidates: Candidate[] = [];
    for (let bi = 0; bi < activeBeams.length; bi++) {
      const beam = activeBeams[bi];
      const logProbs = logProbTable[bi] ?? logProbTable[0]!;
      for (let vi = 0; vi < vocab.length; vi++) {
        const token = vocab[vi]!;
        const tokenLogProb = logProbs[vi] ?? -10;
        const newLogProb = Number((beam.logProb + tokenLogProb).toFixed(4));
        const newLen = beam.tokens.length + 1;
        const penalty = safeAlpha > 0 ? lengthPenalty(newLen, safeAlpha) : 1;
        const newNormScore = Number((newLogProb / penalty).toFixed(4));
        allCandidates.push({
          parentBeamIdx: bi,
          token,
          tokenLogProb: Number(tokenLogProb.toFixed(4)),
          newLogProb,
          newNormScore,
        });
      }
    }

    // 贪心对比：第 0 条 beam 取最大概率 token
    const greedyLogProbs = logProbTable[0] ?? [];
    let greedyBestIdx = 0;
    for (let vi = 1; vi < greedyLogProbs.length; vi++) {
      if ((greedyLogProbs[vi] ?? -Infinity) > (greedyLogProbs[greedyBestIdx] ?? -Infinity)) {
        greedyBestIdx = vi;
      }
    }
    const greedyTok = vocab[greedyBestIdx] ?? vocab[0]!;
    if (greedyTok !== EOS) greedyTokens.push(greedyTok);

    // ── Step B：展示所有候选（展平列表）────────────────────────────
    steps.push({
      id: stepId++,
      description: `第 ${step + 1} 步 · 候选评分：计算每个候选的累积 log 概率 = 父 beam 分数 + log P(token)，共 ${allCandidates.length} 个候选，下一步保留最高 ${safeBeamWidth} 个。`,
      data: {},
      variables: {
        phase: "score",
        step: step + 1,
        maxSteps: safeMaxSteps,
        beamWidth: safeBeamWidth,
        vocab,
        logProbTable,
        beams: activeBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
        candidates: allCandidates.slice(0, 20), // 最多展示 20 个避免过多
        selectedCandidates: [],
        finishedBeams: finishedBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
        greedyTokens: [...greedyTokens],
        finished: false,
        alphaLenPenalty: safeAlpha,
      } as BeamSearchState,
    });

    // 选出 top-beamWidth（按 normScore 降序）
    const sorted = [...allCandidates].sort(
      (a, b) => b.newNormScore - a.newNormScore
    );
    const selected = sorted.slice(0, safeBeamWidth);

    // ── Step C：展示选中的 top-B 候选 ────────────────────────────
    steps.push({
      id: stepId++,
      description: `第 ${step + 1} 步 · 剪枝保留：从 ${allCandidates.length} 个候选中，按归一化分数保留最优 ${safeBeamWidth} 条路径。${selected.map((c) => `"${[...activeBeams[c.parentBeamIdx]!.tokens, c.token].join(" ")}"`).join("、")}`,
      data: {},
      variables: {
        phase: "prune",
        step: step + 1,
        maxSteps: safeMaxSteps,
        beamWidth: safeBeamWidth,
        vocab,
        logProbTable,
        beams: activeBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
        candidates: allCandidates.slice(0, 20),
        selectedCandidates: selected,
        finishedBeams: finishedBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
        greedyTokens: [...greedyTokens],
        finished: false,
        alphaLenPenalty: safeAlpha,
      } as BeamSearchState,
    });

    // 更新 beam 列表
    const nextBeams: Beam[] = [];
    for (const cand of selected) {
      const parent = activeBeams[cand.parentBeamIdx]!;
      const newTokens = [...parent.tokens, cand.token];
      const isEOS = cand.token === EOS;
      const newBeam: Beam = {
        tokens: newTokens,
        logProb: cand.newLogProb,
        normScore: cand.newNormScore,
        isFinished: isEOS,
      };
      if (isEOS) {
        finishedBeams.push(newBeam);
      } else {
        nextBeams.push(newBeam);
      }
    }
    activeBeams = nextBeams;
  }

  // 把剩余活跃 beam 也加入完成列表
  for (const b of activeBeams) {
    finishedBeams.push({ ...b, tokens: [...b.tokens] });
  }

  // 按 normScore 降序排列
  finishedBeams.sort((a, b) => b.normScore - a.normScore);

  // ── 最终步骤 ──────────────────────────────────────────────────
  const best = finishedBeams[0];
  steps.push({
    id: stepId++,
    description: `束搜索完成！共产生 ${finishedBeams.length} 条完整序列。最优序列（归一化分数 = ${best?.normScore.toFixed(4)}）：${best?.tokens.join(" → ")}。对比贪心：${greedyTokens.join(" → ")}。束搜索通过维护多条路径避免了贪心的局部最优。`,
    data: {},
    variables: {
      phase: "complete",
      step: safeMaxSteps,
      maxSteps: safeMaxSteps,
      beamWidth: safeBeamWidth,
      vocab,
      logProbTable: [],
      beams: finishedBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
      candidates: [],
      selectedCandidates: [],
      finishedBeams: finishedBeams.map((b) => ({ ...b, tokens: [...b.tokens] })),
      greedyTokens: [...greedyTokens],
      finished: true,
      alphaLenPenalty: safeAlpha,
    } as BeamSearchState,
  });

  return steps;
}
