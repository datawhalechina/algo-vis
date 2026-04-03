import { VisualizationStep } from "@/types";

export interface FPNLevel {
  name: string;
  rows: number;
  cols: number;
  channels: number;
  /** 归一化的特征强度 0-1 */
  features: number[][];
}

function makeFeature(rows: number, cols: number, seed: number): number[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = 0.5 + 0.4 * Math.sin(r * seed * 0.7 + c * 0.5);
      return Math.max(0, Math.min(1, v));
    })
  );
}

export const BACKBONE_LEVELS: FPNLevel[] = [
  { name: "C2", rows: 8, cols: 8, channels: 256, features: makeFeature(8, 8, 2) },
  { name: "C3", rows: 4, cols: 4, channels: 512, features: makeFeature(4, 4, 3) },
  { name: "C4", rows: 2, cols: 2, channels: 1024, features: makeFeature(2, 2, 5) },
  { name: "C5", rows: 1, cols: 1, channels: 2048, features: makeFeature(1, 1, 7) },
];

export const FPN_LEVELS: FPNLevel[] = [
  { name: "P2", rows: 8, cols: 8, channels: 256, features: makeFeature(8, 8, 8) },
  { name: "P3", rows: 4, cols: 4, channels: 256, features: makeFeature(4, 4, 9) },
  { name: "P4", rows: 2, cols: 2, channels: 256, features: makeFeature(2, 2, 10) },
  { name: "P5", rows: 1, cols: 1, channels: 256, features: makeFeature(1, 1, 11) },
  { name: "P6", rows: 1, cols: 1, channels: 256, features: makeFeature(1, 1, 12) },
];

export function generateFPNSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: "初始化：骨干网络（ResNet）提取 C2~C5 四层特征，通道数依次翻倍，分辨率依次减半",
    data: {},
    variables: { phase: "init", backboneLevels: BACKBONE_LEVELS, fpnLevels: [], activeCIdx: -1, activePIdx: -1 },
  });

  // 展示骨干网络特征
  for (let i = 0; i < BACKBONE_LEVELS.length; i++) {
    const level = BACKBONE_LEVELS[i];
    steps.push({
      id: stepId++,
      description: `骨干网络提取 ${level.name}：${level.rows}×${level.cols} 分辨率，${level.channels} 通道（高语义，低分辨率）`,
      data: {},
      variables: { phase: "backbone", backboneLevels: BACKBONE_LEVELS, fpnLevels: [], activeCIdx: i, activePIdx: -1 },
    });
  }

  steps.push({
    id: stepId++,
    description: "开始 FPN 自顶向下路径：从 C5 开始，经 1×1 卷积降维到 256 通道，逐层上采样并与横向连接（lateral connection）相加",
    data: {},
    variables: { phase: "top_down_start", backboneLevels: BACKBONE_LEVELS, fpnLevels: [], activeCIdx: 3, activePIdx: -1 },
  });

  // Top-down pathway
  const builtFPN: FPNLevel[] = [];
  for (let i = BACKBONE_LEVELS.length - 1; i >= 0; i--) {
    const cLevel = BACKBONE_LEVELS[i];
    const pLevel = FPN_LEVELS[i];
    builtFPN.unshift(pLevel);

    const desc = i === BACKBONE_LEVELS.length - 1
      ? `C5 → 1×1 卷积 → P5（${pLevel.rows}×${pLevel.cols}×256）`
      : `C${i + 2} → 1×1 卷积 + 上采样(P${i + 3}) → P${i + 2}（${pLevel.rows}×${pLevel.cols}×256）`;

    steps.push({
      id: stepId++,
      description: desc,
      data: {},
      variables: {
        phase: "top_down",
        backboneLevels: BACKBONE_LEVELS,
        fpnLevels: [...builtFPN],
        activeCIdx: i,
        activePIdx: i,
        cLevel,
        pLevel,
      },
    });
  }

  // P6 额外下采样
  builtFPN.push(FPN_LEVELS[4]);
  steps.push({
    id: stepId++,
    description: "P5 → 3×3 卷积（步长2）→ P6：用于检测更大目标",
    data: {},
    variables: {
      phase: "p6",
      backboneLevels: BACKBONE_LEVELS,
      fpnLevels: [...builtFPN],
      activeCIdx: -1,
      activePIdx: 4,
    },
  });

  steps.push({
    id: stepId++,
    description: "FPN 完成！P2~P6 每层均为 256 通道，分辨率从大到小，兼顾细节与语义，可检测不同尺度目标",
    data: {},
    variables: {
      phase: "done",
      finished: true,
      backboneLevels: BACKBONE_LEVELS,
      fpnLevels: FPN_LEVELS,
      activeCIdx: -1,
      activePIdx: -1,
    },
  });

  return steps;
}
