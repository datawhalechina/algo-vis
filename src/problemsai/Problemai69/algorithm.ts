import { VisualizationStep } from "@/types";

export interface MMTSample {
  imageLabel: string;
  imageEmoji: string;
  // 6 image patches
  patches: { name: string; color: string }[];
  // text tokens
  tokens: string[];
  // d_model
  dModel: number;
  // token -> patch cross attention raw scores
  crossAttnRaw: number[][];
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateMMTSteps(sample: MMTSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const L = sample.patches.length;
  const T = sample.tokens.length;

  steps.push({
    id: stepId++,
    description: `多模态 Transformer（LXMERT/UNITER 风格）：图像 ${L} 个 patch + 文本 ${T} 个 token 被统一处理。d_model=${sample.dModel}。`,
    data: { sample },
    variables: { phase: "init", sample },
  });

  steps.push({
    id: stepId++,
    description: `图像分块：图像被分为 ${L} 个 patch，每个 patch 经线性投影得到 token embedding p_i ∈ ℝ^${sample.dModel}，加上位置嵌入 pos_p。`,
    data: {},
    variables: { phase: "image_tokens", sample },
  });

  steps.push({
    id: stepId++,
    description: `文本 token：${T} 个 word token 经 word embedding + position embedding 得到 e_j ∈ ℝ^${sample.dModel}。`,
    data: {},
    variables: { phase: "text_tokens", sample },
  });

  steps.push({
    id: stepId++,
    description: `输入序列拼接：[CLS, p_1, ..., p_${L}, SEP, e_1, ..., e_${T}, SEP]。两个模态共享同一 Transformer，可选 Segment Embedding 区分模态。`,
    data: {},
    variables: { phase: "concat", sample },
  });

  steps.push({
    id: stepId++,
    description: `单流 Transformer 层：Self-Attention 让每个 token（不论图像还是文本）都可以关注所有其他 token，自然形成跨模态交互。`,
    data: {},
    variables: { phase: "self_attn", sample },
  });

  const crossAttnNorm = sample.crossAttnRaw.map((row) => softmax(row));
  steps.push({
    id: stepId++,
    description: `双流变体（LXMERT）：在跨模态层使用 Cross-Attention，Q 来自一种模态，K/V 来自另一种。此处展示文本→图像的交叉注意力。`,
    data: { crossAttn: crossAttnNorm },
    variables: {
      phase: "cross_attn",
      sample,
      crossAttn: crossAttnNorm,
    },
  });

  steps.push({
    id: stepId++,
    description: `多层 Transformer 堆叠后，[CLS] token 的 hidden state 聚合了多模态信息，输出给下游任务（VQA、Retrieval 等）。`,
    data: {},
    variables: {
      phase: "pool",
      sample,
      crossAttn: crossAttnNorm,
    },
  });

  steps.push({
    id: stepId++,
    description: `多模态 Transformer 处理完成！统一架构实现了视觉和语言的联合建模。`,
    data: { finished: true },
    variables: {
      phase: "complete",
      sample,
      crossAttn: crossAttnNorm,
      finished: true,
    },
  });

  return steps;
}
