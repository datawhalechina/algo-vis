import { VisualizationStep } from "@/types";

export interface VLPSample {
  imageLabel: string;
  imageEmoji: string;
  // 图像原特征
  imageFeat: number[];
  // 文本 tokens，其中可能有 [MASK]
  tokens: string[];
  // 原始未 mask 的 tokens（用于 MLM 目标）
  origTokens: string[];
  // 被 mask 的位置索引
  maskedIdx: number;
  // 候选词及其预测 logit
  maskCandidates: { word: string; logit: number }[];
  // ITM 标签（true = matched, false = not matched）
  itmLabel: boolean;
  // ITM 分数（logit for matched）
  itmLogit: number;
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

function sigmoid(x: number): number {
  return Number((1 / (1 + Math.exp(-x))).toFixed(4));
}

export function generateVLPSteps(sample: VLPSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `视觉-语言预训练（VLP，如 BLIP / ALIGN）：图像 "${sample.imageLabel}" + 文本，通过 MLM、ITM、ITC 多任务联合训练。`,
    data: { sample },
    variables: { phase: "init", sample },
  });

  steps.push({
    id: stepId++,
    description: `视觉编码器（ViT）将图像分为 patch 序列 p_1..p_L，文本编码器（BERT）将文本转为 token 嵌入 e_1..e_T。`,
    data: {},
    variables: { phase: "encode", sample },
  });

  // 对 token 序列做 mask 展示
  steps.push({
    id: stepId++,
    description: `MLM 目标：随机选择 15% 的 token 替换为 [MASK]（此例第 ${sample.maskedIdx + 1} 个词 "${sample.origTokens[sample.maskedIdx]}" 被 mask）。`,
    data: {},
    variables: {
      phase: "mask",
      sample,
      maskedIdx: sample.maskedIdx,
    },
  });

  // 跨模态交互（cross-attention）
  steps.push({
    id: stepId++,
    description: `跨模态 Transformer：文本特征 Q 对图像 patch K/V 做交叉注意力，让文本 token 利用图像信息预测被 mask 的词。`,
    data: {},
    variables: { phase: "cross", sample },
  });

  // MLM 预测
  const maskLogits = sample.maskCandidates.map((c) => c.logit);
  const maskProbs = softmax(maskLogits);
  const bestIdx = maskProbs.indexOf(Math.max(...maskProbs));
  const bestWord = sample.maskCandidates[bestIdx]?.word;

  steps.push({
    id: stepId++,
    description: `MLM 预测：对 [MASK] 位置的 hidden state 经 LM head 输出候选词分布 p(w|context)，模型预测 "${bestWord}"。`,
    data: { maskProbs },
    variables: {
      phase: "mlm",
      sample,
      maskProbs,
      bestWord,
    },
  });

  // ITM
  const itmProb = sigmoid(sample.itmLogit);
  steps.push({
    id: stepId++,
    description: `ITM 目标：[CLS] token 的 hidden state 经二分类头输出 match 概率 = σ(${sample.itmLogit.toFixed(2)}) = ${itmProb}。Ground truth: ${
      sample.itmLabel ? "Matched" : "Not Matched"
    }。`,
    data: { itmProb },
    variables: {
      phase: "itm",
      sample,
      maskProbs,
      bestWord,
      itmProb,
    },
  });

  // 损失
  const mlmLoss = Number(
    (-Math.log(Math.max(maskProbs[bestIdx], 1e-8))).toFixed(4)
  );
  const itmTarget = sample.itmLabel ? 1 : 0;
  const itmLoss = Number(
    (
      -(
        itmTarget * Math.log(Math.max(itmProb, 1e-8)) +
        (1 - itmTarget) * Math.log(Math.max(1 - itmProb, 1e-8))
      )
    ).toFixed(4)
  );
  const totalLoss = Number((mlmLoss + itmLoss).toFixed(4));

  steps.push({
    id: stepId++,
    description: `联合预训练损失：L = L_MLM + L_ITM = ${mlmLoss} + ${itmLoss} = ${totalLoss}。模型通过最小化该损失学习通用视觉-语言表示。`,
    data: { mlmLoss, itmLoss, totalLoss },
    variables: {
      phase: "loss",
      sample,
      maskProbs,
      bestWord,
      itmProb,
      mlmLoss,
      itmLoss,
      totalLoss,
    },
  });

  steps.push({
    id: stepId++,
    description: `预训练完成！模型可迁移到下游任务（VQA、图像检索、image captioning 等）。`,
    data: { finished: true },
    variables: {
      phase: "complete",
      sample,
      maskProbs,
      bestWord,
      itmProb,
      mlmLoss,
      itmLoss,
      totalLoss,
      finished: true,
    },
  });

  return steps;
}
