import { VisualizationStep } from "@/types";

export interface DialogueTurn {
  role: "user" | "assistant";
  text: string;
}

export interface DialogueSample {
  imageLabel: string;
  imageEmoji: string;
  imageRegions: { name: string; color: string; emoji: string }[];
  history: DialogueTurn[];
  currentQuestion: string;
  // attention from answer to image regions
  visualAttention: number[];
  // attention from answer to history turns
  historyAttention: number[];
  // candidate next tokens to reveal progressively
  responseTokens: string[];
  // token-level logits to visualize distribution
  tokenProbs: { token: string; prob: number }[];
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateDialogueSteps(
  sample: DialogueSample
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `多模态对话：基于图像 "${sample.imageLabel}" 和 ${sample.history.length} 轮对话历史，回答当前问题 "${sample.currentQuestion}"。`,
    data: { sample },
    variables: { phase: "init", sample },
  });

  steps.push({
    id: stepId++,
    description: `视觉编码：图像通过 Vision Encoder（如 CLIP ViT）提取 patch 特征 V，作为视觉上下文。`,
    data: {},
    variables: { phase: "visual_encode", sample },
  });

  steps.push({
    id: stepId++,
    description: `对话历史编码：将所有历史轮次 H_1..H_${sample.history.length} 和当前问题 Q 作为文本输入 LLM 解码器。`,
    data: {},
    variables: { phase: "history_encode", sample },
  });

  // 视觉注意力
  const visAttnNorm = softmax(sample.visualAttention);
  steps.push({
    id: stepId++,
    description: `视觉注意力：模型对图像各区域做 attention，α_v = softmax(q·V^T/√d)。关注与问题相关的视觉证据。`,
    data: { visualAttn: visAttnNorm },
    variables: {
      phase: "visual_attn",
      sample,
      visualAttn: visAttnNorm,
    },
  });

  // 历史注意力
  const histAttnNorm = softmax(sample.historyAttention);
  steps.push({
    id: stepId++,
    description: `历史注意力：模型还关注对话历史中的相关信息，确保回复符合上下文。`,
    data: { historyAttn: histAttnNorm },
    variables: {
      phase: "history_attn",
      sample,
      visualAttn: visAttnNorm,
      historyAttn: histAttnNorm,
    },
  });

  // 融合上下文
  steps.push({
    id: stepId++,
    description: `融合上下文：视觉特征 v* 和文本特征 t* 在 LLM 中通过自注意力融合，形成统一的上下文表示。`,
    data: {},
    variables: {
      phase: "fuse",
      sample,
      visualAttn: visAttnNorm,
      historyAttn: histAttnNorm,
    },
  });

  // 逐 token 生成
  const generated: string[] = [];
  for (let t = 0; t < sample.responseTokens.length; t++) {
    generated.push(sample.responseTokens[t]);
    steps.push({
      id: stepId++,
      description: `自回归生成第 ${t + 1} 个 token："${sample.responseTokens[t]}"。模型根据上下文 p(y_t|y_{<t}, I, H) 采样或贪心选择。`,
      data: { generated: [...generated] },
      variables: {
        phase: "generate",
        sample,
        visualAttn: visAttnNorm,
        historyAttn: histAttnNorm,
        generated: [...generated],
        currentStep: t,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `对话生成完成！最终回复：${generated.join(" ")}`,
    data: { finished: true },
    variables: {
      phase: "complete",
      sample,
      visualAttn: visAttnNorm,
      historyAttn: histAttnNorm,
      generated,
      finished: true,
    },
  });

  return steps;
}
