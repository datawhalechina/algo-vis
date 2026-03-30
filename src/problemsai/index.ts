import { ComponentType, lazy } from "react";

export const aiVisualizerRegistry: Record<number, ComponentType> = {
  10001: lazy(() => import("./Problemai1/VisionAttentionVisualizer")),
  10002: lazy(() => import("./Problemai2/ScaledDotProductAttentionVisualizer")),
  10003: lazy(() => import("./Problemai3/MultiHeadAttentionVisualizer")),
  10004: lazy(() => import("./Problemai4/SelfAttentionVisualizer")),
  10005: lazy(() => import("./Problemai5/PositionalEncodingVisualizer")),
  10006: lazy(() => import("./Problemai6/CausalAttentionVisualizer")),
  10007: lazy(() => import("./Problemai7/FFNVisualizer")),
  10008: lazy(() => import("./Problemai8/LayerNormVisualizer")),
  10009: lazy(() => import("./Problemai9/ResidualConnectionVisualizer")),
  10010: lazy(() => import("./Problemai10/CrossAttentionVisualizer")),
  10011: lazy(() => import("./Problemai11/AutoregressiveVisualizer")),
  10012: lazy(() => import("./Problemai12/TopKSamplingVisualizer")),
  10013: lazy(() => import("./Problemai13/TopPSamplingVisualizer")),
  10014: lazy(() => import("./Problemai14/TemperatureSamplingVisualizer")),
  10015: lazy(() => import("./Problemai15/BeamSearchVisualizer")),
  10026: lazy(() => import("./Problemai26/ConvolutionVisualizer")),
  10027: lazy(() => import("./Problemai27/MaxPoolingVisualizer")),
  10028: lazy(() => import("./Problemai28/BatchNormVisualizer")),
  10029: lazy(() => import("./Problemai29/ResidualConnectionVisualizer")),
  10016: lazy(() => import("./Problemai16/TransformerEncoderVisualizer")),
  10030: lazy(() => import("./Problemai30/NMSVisualizer")),
};

export function hasAiVisualizer(problemId: number): boolean {
  return problemId in aiVisualizerRegistry;
}

export function getAiVisualizer(problemId: number): ComponentType | null {
  return aiVisualizerRegistry[problemId] || null;
}
