import { ComponentType, lazy } from "react";

export const aiVisualizerRegistry: Record<number, ComponentType> = {
  10001: lazy(() => import("./ProblemAI1/VisionAttentionVisualizer")),
};

export function hasAiVisualizer(problemId: number): boolean {
  return problemId in aiVisualizerRegistry;
}

export function getAiVisualizer(problemId: number): ComponentType | null {
  return aiVisualizerRegistry[problemId] || null;
}
