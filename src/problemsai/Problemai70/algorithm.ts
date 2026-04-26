import { VisualizationStep } from "@/types";

export interface BBox {
  id: string;
  label: string;
  emoji: string;
  // [x1, y1, x2, y2] in 0..100
  box: [number, number, number, number];
  // visual feature
  feature: number[];
}

export interface GroundingScene {
  imageLabel: string;
  queryTokens: string[];
  queryEmbedding: number[];
  proposals: BBox[];
}

function l2norm(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => Number((x / n).toFixed(4)));
}

function cosineSim(a: number[], b: number[]): number {
  const na = l2norm(a);
  const nb = l2norm(b);
  let s = 0;
  for (let i = 0; i < na.length; i++) s += na[i] * nb[i];
  return Number(s.toFixed(4));
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateGroundingSteps(
  scene: GroundingScene
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const N = scene.proposals.length;

  steps.push({
    id: stepId++,
    description: `视觉定位：在图像 "${scene.imageLabel}" 中根据文本查询 "${scene.queryTokens.join(" ")}" 定位对应边界框。共 ${N} 个候选框。`,
    data: { scene },
    variables: { phase: "init", scene },
  });

  steps.push({
    id: stepId++,
    description: `候选区域生成：通过 RPN 或预训练检测器提出 ${N} 个候选框 {b_1, ..., b_${N}}。`,
    data: {},
    variables: { phase: "proposals", scene },
  });

  steps.push({
    id: stepId++,
    description: `区域特征提取：对每个候选框经 ROI Pooling + 编码器得到视觉特征 r_i ∈ ℝ^d。`,
    data: {},
    variables: { phase: "region_features", scene },
  });

  steps.push({
    id: stepId++,
    description: `查询编码：文本查询经 BERT 等文本编码器得到 q ∈ ℝ^d。`,
    data: {},
    variables: { phase: "query_encode", scene },
  });

  // 逐个计算匹配分数
  const scores: number[] = [];
  for (let i = 0; i < N; i++) {
    scores.push(cosineSim(scene.queryEmbedding, scene.proposals[i].feature));
    steps.push({
      id: stepId++,
      description: `计算文本-区域匹配分数 s_${i} = cos(q, r_${i}) = ${scores[i].toFixed(4)}（框 "${scene.proposals[i].label}"）。`,
      data: { scores: [...scores] },
      variables: {
        phase: "match_score",
        scene,
        scores: [...scores],
        currentIdx: i,
      },
    });
  }

  // Softmax
  const probs = softmax(scores.map((s) => s * 10)); // 锐化
  steps.push({
    id: stepId++,
    description: `Softmax 得到每个候选框是目标的概率分布 p_i = softmax(α·s_i)。`,
    data: { probs },
    variables: {
      phase: "softmax",
      scene,
      scores,
      probs,
    },
  });

  // argmax
  const bestIdx = probs.indexOf(Math.max(...probs));
  const bestBox = scene.proposals[bestIdx];
  steps.push({
    id: stepId++,
    description: `最终定位：argmax = 框 ${bestIdx}（"${bestBox.label}"），坐标 [${bestBox.box.join(", ")}]，置信度 ${(probs[bestIdx] * 100).toFixed(1)}%。`,
    data: { bestIdx, bestBox, finished: true },
    variables: {
      phase: "complete",
      scene,
      scores,
      probs,
      bestIdx,
      finished: true,
    },
  });

  return steps;
}
