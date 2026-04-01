import { VisualizationStep } from "@/types";

export type PixelClass = number; // 0 = background, 1..N = classes

export interface SegMap {
  rows: number;
  cols: number;
  /** 每个像素的类别 */
  labels: PixelClass[][];
}

export interface EncoderLevel {
  name: string;
  rows: number;
  cols: number;
  /** 归一化的激活强度 0-1 */
  activation: number[][];
}

const CLASS_NAMES = ["背景", "人物", "车辆", "建筑", "植被"];

function makeFakeActivation(rows: number, cols: number, seed: number): number[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = Math.sin((r + seed) * 0.8) * Math.cos((c + seed) * 0.6) * 0.5 + 0.5;
      return Math.max(0, Math.min(1, v));
    })
  );
}

function makeSegMap(): SegMap {
  const rows = 8;
  const cols = 8;
  const labels: PixelClass[][] = [
    [0,0,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,1,1,1,1,0,2,0],
    [0,1,1,1,1,0,2,2],
    [0,0,1,1,0,0,2,2],
    [3,3,3,0,0,4,4,4],
    [3,3,3,3,4,4,4,4],
    [3,3,3,3,4,4,4,4],
  ];
  return { rows, cols, labels };
}

export const ENCODER_LEVELS: EncoderLevel[] = [
  { name: "输入图像", rows: 8, cols: 8, activation: makeFakeActivation(8, 8, 1) },
  { name: "编码器 L1 (8×8)", rows: 8, cols: 8, activation: makeFakeActivation(8, 8, 2) },
  { name: "编码器 L2 (4×4)", rows: 4, cols: 4, activation: makeFakeActivation(4, 4, 3) },
  { name: "编码器 L3 (2×2)", rows: 2, cols: 2, activation: makeFakeActivation(2, 2, 4) },
  { name: "解码器 L2 (4×4)", rows: 4, cols: 4, activation: makeFakeActivation(4, 4, 5) },
  { name: "解码器 L1 (8×8)", rows: 8, cols: 8, activation: makeFakeActivation(8, 8, 6) },
];

export function generateSegmentationSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const segMap = makeSegMap();

  steps.push({
    id: stepId++,
    description: `初始化：输入 ${segMap.rows}×${segMap.cols} 图像，共 ${CLASS_NAMES.length} 个类别`,
    data: {},
    variables: { phase: "init", classNames: CLASS_NAMES, segMap },
  });

  // Encoder pass
  for (let i = 0; i <= 2; i++) {
    const level = ENCODER_LEVELS[i];
    steps.push({
      id: stepId++,
      description: `编码阶段 — ${level.name}：提取特征，分辨率${i > 0 ? "降低" : "保持"}`,
      data: {},
      variables: {
        phase: "encode",
        activeLevelIdx: i,
        level,
        classNames: CLASS_NAMES,
        segMap,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: "编码完成，最小分辨率的特征图包含丰富语义，但丢失空间细节",
    data: {},
    variables: { phase: "bottleneck", activeLevelIdx: 3, classNames: CLASS_NAMES, segMap },
  });

  // Decoder pass
  for (let i = 4; i <= 5; i++) {
    const level = ENCODER_LEVELS[i];
    steps.push({
      id: stepId++,
      description: `解码阶段 — ${level.name}：上采样恢复分辨率，跳跃连接补充空间细节`,
      data: {},
      variables: {
        phase: "decode",
        activeLevelIdx: i,
        level,
        classNames: CLASS_NAMES,
        segMap,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `Softmax 输出像素级分类结果，每个像素属于 ${CLASS_NAMES.length} 类之一`,
    data: {},
    variables: {
      phase: "softmax",
      classNames: CLASS_NAMES,
      segMap,
    },
  });

  steps.push({
    id: stepId++,
    description: "语义分割完成！输出与输入同尺寸的分割掩码",
    data: {},
    variables: {
      phase: "done",
      finished: true,
      classNames: CLASS_NAMES,
      segMap,
    },
  });

  return steps;
}

export { CLASS_NAMES, makeSegMap };
