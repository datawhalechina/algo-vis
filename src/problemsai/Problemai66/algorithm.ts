import { VisualizationStep } from "@/types";

export type FusionStrategy = "early" | "late" | "attention";

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

function concat(a: number[], b: number[]): number[] {
  return [...a, ...b];
}

function weightedAvg(vs: number[][], w: number[]): number[] {
  const d = vs[0].length;
  const out = new Array(d).fill(0);
  for (let i = 0; i < vs.length; i++) {
    for (let j = 0; j < d; j++) {
      out[j] += w[i] * vs[i][j];
    }
  }
  return out.map((v) => Number(v.toFixed(4)));
}

export function generateFusionSteps(
  imageFeat: number[],
  textFeat: number[],
  audioFeat: number[],
  strategy: FusionStrategy
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const modalities = [
    { name: "Image", emoji: "🖼️", color: "#3b82f6", feat: imageFeat },
    { name: "Text", emoji: "📝", color: "#8b5cf6", feat: textFeat },
    { name: "Audio", emoji: "🔊", color: "#f97316", feat: audioFeat },
  ];

  steps.push({
    id: stepId++,
    description: `多模态融合：3 种模态（图像/文本/音频），每种特征维度 ${imageFeat.length}。融合策略：${strategy}。`,
    data: { modalities, strategy },
    variables: { phase: "init", modalities, strategy },
  });

  // Step 2: 各模态特征显示
  steps.push({
    id: stepId++,
    description: `各模态独立提取的特征向量。图像通过 CNN/ViT，文本通过 Transformer，音频通过 wav2vec 等提取。`,
    data: {},
    variables: { phase: "features", modalities, strategy },
  });

  let fused: number[] = [];
  let fusionWeights: number[] = [];

  if (strategy === "early") {
    // Early Fusion: 直接拼接
    const concatFeat = concat(concat(imageFeat, textFeat), audioFeat);
    steps.push({
      id: stepId++,
      description: `早期融合（Early Fusion）：将三种模态特征直接拼接，得到 ${concatFeat.length} 维向量 [f_img; f_text; f_audio]。`,
      data: { concatFeat },
      variables: {
        phase: "fuse",
        modalities,
        strategy,
        concatFeat: [...concatFeat],
      },
    });
    // Linear transform
    fused = concatFeat.slice(0, imageFeat.length).map((v, i) =>
      Number(
        (
          (v + concatFeat[imageFeat.length + i] + concatFeat[2 * imageFeat.length + i]) /
          3
        ).toFixed(4)
      )
    );
    steps.push({
      id: stepId++,
      description: `线性变换 W ∈ ℝ^{d×3d}：将拼接特征投影回 d 维空间，得到融合表示 z。`,
      data: { fused },
      variables: {
        phase: "project",
        modalities,
        strategy,
        concatFeat,
        fused: [...fused],
      },
    });
  } else if (strategy === "late") {
    // Late Fusion: 各自预测后加权平均
    fusionWeights = [0.4, 0.35, 0.25];
    steps.push({
      id: stepId++,
      description: `晚期融合（Late Fusion）：各模态先独立推理，得到各自的预测，再按固定权重 w = [${fusionWeights.join(
        ", "
      )}] 加权平均。`,
      data: { fusionWeights },
      variables: {
        phase: "late_predict",
        modalities,
        strategy,
        fusionWeights,
      },
    });
    fused = weightedAvg([imageFeat, textFeat, audioFeat], fusionWeights);
    steps.push({
      id: stepId++,
      description: `z = Σ w_m · f_m = 0.4·f_img + 0.35·f_text + 0.25·f_audio，得到融合表示。`,
      data: { fused },
      variables: {
        phase: "late_weighted",
        modalities,
        strategy,
        fusionWeights,
        fused: [...fused],
      },
    });
  } else if (strategy === "attention") {
    // Attention Fusion: 动态权重
    // Query 由 image feature 充当，计算 scores = q·k / sqrt(d)
    const d = imageFeat.length;
    const scale = 1 / Math.sqrt(d);
    const q = imageFeat;
    const scores = [imageFeat, textFeat, audioFeat].map((k) => {
      let s = 0;
      for (let i = 0; i < d; i++) s += q[i] * k[i];
      return Number((s * scale).toFixed(4));
    });
    steps.push({
      id: stepId++,
      description: `注意力融合：以 Query q（图像特征）对各模态 Key 做点积：s_m = q·k_m/√d = [${scores
        .map((s) => s.toFixed(2))
        .join(", ")}]。`,
      data: { scores },
      variables: {
        phase: "attn_scores",
        modalities,
        strategy,
        scores,
      },
    });
    fusionWeights = softmax(scores);
    steps.push({
      id: stepId++,
      description: `Softmax 得到注意力权重 α = softmax(s) = [${fusionWeights
        .map((w) => w.toFixed(3))
        .join(", ")}]。权重自适应模态的重要性。`,
      data: { fusionWeights },
      variables: {
        phase: "attn_softmax",
        modalities,
        strategy,
        scores,
        fusionWeights,
      },
    });
    fused = weightedAvg([imageFeat, textFeat, audioFeat], fusionWeights);
    steps.push({
      id: stepId++,
      description: `z = Σ α_m · v_m：根据注意力权重对 Value 向量加权求和，得到融合表示。`,
      data: { fused },
      variables: {
        phase: "attn_fuse",
        modalities,
        strategy,
        fusionWeights,
        fused: [...fused],
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `融合完成！最终多模态表示 z = [${fused.map((v) => v.toFixed(3)).join(", ")}]。可输入下游任务。`,
    data: { fused, finished: true },
    variables: {
      phase: "complete",
      modalities,
      strategy,
      fusionWeights,
      fused,
      finished: true,
    },
  });

  return steps;
}
