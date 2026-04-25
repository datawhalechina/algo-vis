import { VisualizationStep } from "@/types";

export interface VideoFrame {
  emoji: string;
  label: string;
  // 4-dim feature
  feature: number[];
}

export interface VideoClip {
  label: string;
  action: string;
  frames: VideoFrame[];
  // 候选动作类别及其原始分数
  classScores: { action: string; score: number }[];
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateVideoUnderstandingSteps(
  clip: VideoClip
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const N = clip.frames.length;
  const D = clip.frames[0]?.feature.length ?? 4;

  steps.push({
    id: stepId++,
    description: `视频理解任务：分析视频 "${clip.label}"（${N} 帧），识别动作/事件。`,
    data: { clip },
    variables: { phase: "init", clip, N, D },
  });

  // Step 2: 逐帧提取空间特征（2D CNN）
  const frameFeats: number[][] = [];
  for (let i = 0; i < N; i++) {
    frameFeats.push([...clip.frames[i].feature]);
    steps.push({
      id: stepId++,
      description: `2D CNN 提取第 ${i + 1} 帧的空间特征 f_${i} ∈ ℝ^${D}（"${clip.frames[i].label}"）。`,
      data: {},
      variables: {
        phase: "spatial",
        clip,
        N,
        D,
        frameFeats: frameFeats.map((f) => [...f]),
        currentIdx: i,
      },
    });
  }

  // Step 3: 时序建模（Temporal 平均 + 相邻差分模拟 3D CNN/Video Transformer）
  const temporalFeat = new Array(D).fill(0);
  for (let i = 0; i < N; i++) {
    for (let d = 0; d < D; d++) {
      temporalFeat[d] += frameFeats[i][d];
    }
  }
  for (let d = 0; d < D; d++) {
    temporalFeat[d] = Number((temporalFeat[d] / N).toFixed(4));
  }
  steps.push({
    id: stepId++,
    description: `时序池化：对 N=${N} 帧特征沿时间维做平均/3D 卷积，得到时序特征 h_t = 1/N · Σ f_i ∈ ℝ^${D}。实际模型（I3D、Video Transformer）会用更复杂的时空融合。`,
    data: { temporalFeat },
    variables: {
      phase: "temporal",
      clip,
      N,
      D,
      frameFeats,
      temporalFeat: [...temporalFeat],
    },
  });

  // Step 4: 时空融合
  steps.push({
    id: stepId++,
    description: `时空融合：将空间帧特征与时序特征拼接/融合为 spatiotemporal 表示 h_{st}，捕获"哪个物体在做什么"。`,
    data: {},
    variables: {
      phase: "spatiotemporal",
      clip,
      N,
      D,
      frameFeats,
      temporalFeat,
    },
  });

  // Step 5: 分类器 -> Softmax
  const rawScores = clip.classScores.map((c) => c.score);
  const probs = softmax(rawScores);
  steps.push({
    id: stepId++,
    description: `动作分类器输出 logits，经 Softmax 得到候选动作概率分布。`,
    data: { probs },
    variables: {
      phase: "classify",
      clip,
      N,
      D,
      frameFeats,
      temporalFeat,
      probs,
    },
  });

  // Step 6: 完成
  const argmax = probs.indexOf(Math.max(...probs));
  const predAction = clip.classScores[argmax]?.action ?? clip.action;
  steps.push({
    id: stepId++,
    description: `预测动作：argmax = "${predAction}"（置信度 ${(probs[argmax] * 100).toFixed(1)}%）。视频理解完成。`,
    data: { predAction, finished: true },
    variables: {
      phase: "complete",
      clip,
      N,
      D,
      frameFeats,
      temporalFeat,
      probs,
      predAction,
      finished: true,
    },
  });

  return steps;
}
