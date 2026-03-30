import { VisualizationStep } from "@/types";

export interface CompletedGenStep {
  genStep: number;
  inputTokens: string[];
  selectedToken: string;
  prob: number;
}

export interface AutoregressiveState extends Record<string, unknown> {
  phase: string;
  /** 当前第几个生成步（1-indexed，0 = init） */
  genStep: number;
  maxNewTokens: number;
  /** 当前完整 token 序列（上下文窗口） */
  tokens: string[];
  /** 本步生成时的输入快照（用于高亮"输入"部分） */
  inputTokensForStep: string[];
  promptLen: number;
  vocab: string[];
  temperature: number;
  logits: number[];
  probs: number[];
  selectedIdx: number;
  selectedToken: string;
  /** 已完成的历史步骤列表，用于渲染自回归链 */
  completedSteps: CompletedGenStep[];
  finished: boolean;
}

function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map((v) => v / Math.max(temperature, 1e-6));
  const maxV = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - maxV));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateAutoregressiveSteps(
  promptTokens: string[],
  vocab: string[],
  maxNewTokens: number,
  temperature: number,
  seed: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const safeVocab =
    vocab.length > 0
      ? vocab
      : ["hello", "world", "the", "cat", "sat", "on", "mat", "<EOS>"];
  const safePT = promptTokens.length > 0 ? promptTokens : ["the"];
  const safeTemp = Math.max(temperature, 0.01);
  const safeMax = Math.max(maxNewTokens, 1);
  const tokens: string[] = [...safePT];
  const promptLen = safePT.length;
  const completedSteps: CompletedGenStep[] = [];

  // ── init ────────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `初始化：Prompt 包含 ${promptLen} 个 token："${safePT.join(
      " "
    )}"。温度 T = ${safeTemp}，最多生成 ${safeMax} 个新 token。自回归过程将循环：输入序列 → 模型 → 概率分布 → 采样 → 追加 → 成为下一步输入。`,
    data: { tokens: [...tokens] },
    variables: {
      phase: "init",
      genStep: 0,
      maxNewTokens: safeMax,
      tokens: [...tokens],
      inputTokensForStep: [...tokens],
      promptLen,
      vocab: safeVocab,
      temperature: safeTemp,
      logits: [],
      probs: [],
      selectedIdx: -1,
      selectedToken: "",
      completedSteps: [],
      finished: false,
    } as AutoregressiveState,
  });

  // LCG 伪随机
  let rng = seed;
  function nextRand(): number {
    rng = (rng * 1664525 + 1013904223) & 0xffffffff;
    return (rng >>> 0) / 0xffffffff;
  }

  function makeLogits(step: number, prevTokens: string[]): number[] {
    const lastTok = prevTokens[prevTokens.length - 1] ?? "";
    return safeVocab.map((tok, i) => {
      const base = nextRand() * 4 - 2;
      const eosBonus = tok === "<EOS>" ? Math.max(0, (step - 2) * 0.8) : 0;
      const repeatPenalty = tok === lastTok ? -1.5 : 0;
      return Number(
        (
          base +
          eosBonus +
          repeatPenalty +
          (i % 3 === step % 3 ? 0.5 : 0)
        ).toFixed(4)
      );
    });
  }

  let finished = false;

  for (let step = 0; step < safeMax && !finished; step++) {
    const genStep = step + 1;
    const inputTokensForStep = [...tokens];
    const snapshotCompleted = completedSteps.map((s) => ({ ...s }));

    // ── ① feed：序列送入模型 ────────────────────────────
    steps.push({
      id: stepId++,
      description: `第 ${genStep} 步 – ① 输入：将当前 ${tokens.length} 个 token 的上下文序列送入语言模型。`,
      data: { tokens: [...tokens] },
      variables: {
        phase: "feed",
        genStep,
        maxNewTokens: safeMax,
        tokens: [...tokens],
        inputTokensForStep,
        promptLen,
        vocab: safeVocab,
        temperature: safeTemp,
        logits: [],
        probs: [],
        selectedIdx: -1,
        selectedToken: "",
        completedSteps: snapshotCompleted,
        finished: false,
      } as AutoregressiveState,
    });

    // ── ② logits：模型输出原始 logits ──────────────────
    const logits = makeLogits(step, tokens);
    steps.push({
      id: stepId++,
      description: `第 ${genStep} 步 – ② 模型前向：语言模型输出下一个 token 的原始 logits（${safeVocab.length} 维）。`,
      data: { logits },
      variables: {
        phase: "logits",
        genStep,
        maxNewTokens: safeMax,
        tokens: [...tokens],
        inputTokensForStep,
        promptLen,
        vocab: safeVocab,
        temperature: safeTemp,
        logits,
        probs: [],
        selectedIdx: -1,
        selectedToken: "",
        completedSteps: snapshotCompleted,
        finished: false,
      } as AutoregressiveState,
    });

    // ── ③ softmax：温度缩放 + 归一化 ───────────────────
    const probs = softmax(logits, safeTemp);
    steps.push({
      id: stepId++,
      description: `第 ${genStep} 步 – ③ Softmax：logits / T（T=${safeTemp}），再经 softmax 得到概率分布，各词概率之和 = 1。`,
      data: { probs, logits },
      variables: {
        phase: "softmax",
        genStep,
        maxNewTokens: safeMax,
        tokens: [...tokens],
        inputTokensForStep,
        promptLen,
        vocab: safeVocab,
        temperature: safeTemp,
        logits,
        probs,
        selectedIdx: -1,
        selectedToken: "",
        completedSteps: snapshotCompleted,
        finished: false,
      } as AutoregressiveState,
    });

    // ── ④ select：采样选词 ─────────────────────────────
    const selectedIdx = probs.indexOf(Math.max(...probs));
    const selectedToken = safeVocab[selectedIdx] ?? "<UNK>";
    steps.push({
      id: stepId++,
      description: `第 ${genStep} 步 – ④ 采样：选择概率最高的 token "${selectedToken}"（p = ${(
        probs[selectedIdx] ?? 0
      ).toFixed(4)}）。`,
      data: { selectedIdx, selectedToken },
      variables: {
        phase: "select",
        genStep,
        maxNewTokens: safeMax,
        tokens: [...tokens],
        inputTokensForStep,
        promptLen,
        vocab: safeVocab,
        temperature: safeTemp,
        logits,
        probs,
        selectedIdx,
        selectedToken,
        completedSteps: snapshotCompleted,
        finished: false,
      } as AutoregressiveState,
    });

    // 追加 token
    tokens.push(selectedToken);
    finished = selectedToken === "<EOS>" || step === safeMax - 1;
    completedSteps.push({
      genStep,
      inputTokens: [...inputTokensForStep],
      selectedToken,
      prob: probs[selectedIdx] ?? 0,
    });

    // ── ⑤ append：追加并形成自回归反馈 ────────────────
    steps.push({
      id: stepId++,
      description: finished
        ? `第 ${genStep} 步 – ⑤ 追加完成：${
            selectedToken === "<EOS>"
              ? "遇到 <EOS>，生成结束"
              : `已达最大步数 ${safeMax}`
          }。最终序列："${tokens.join(" ")}"。`
        : `第 ${genStep} 步 – ⑤ 自回归反馈：将 "${selectedToken}" 追加到序列，形成新的上下文（${tokens.length} 个 token）。此序列将作为第 ${
            genStep + 1
          } 步的输入，完成一次自回归循环。`,
      data: { tokens: [...tokens] },
      variables: {
        phase: finished ? "complete" : "append",
        genStep,
        maxNewTokens: safeMax,
        tokens: [...tokens],
        inputTokensForStep,
        promptLen,
        vocab: safeVocab,
        temperature: safeTemp,
        logits,
        probs,
        selectedIdx,
        selectedToken,
        completedSteps: completedSteps.map((s) => ({ ...s })),
        finished,
      } as AutoregressiveState,
    });
  }

  return steps;
}
