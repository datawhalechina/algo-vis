import { ComponentType, lazy } from "react";

export const aiVisualizerRegistry: Record<number, ComponentType> = {
  10001: lazy(() => import("./Problemai1/VisionAttentionVisualizer")),
  10026: lazy(() => import("./Problemai26/ConvolutionVisualizer")),
  10027: lazy(() => import("./Problemai27/MaxPoolingVisualizer")),
  10028: lazy(() => import("./Problemai28/BatchNormVisualizer")),
  10029: lazy(() => import("./Problemai29/ResidualConnectionVisualizer")),
  10030: lazy(() => import("./Problemai30/NMSVisualizer")),
};

export function hasAiVisualizer(problemId: number): boolean {
  return problemId in aiVisualizerRegistry;
}

export function getAiVisualizer(problemId: number): ComponentType | null {
  return aiVisualizerRegistry[problemId] || null;
}
