import { ComponentType, lazy } from "react";

const GuidedDRLLessonVisualizer = lazy(
  () => import("@/components/visualizers/GuidedDRLLessonVisualizer"),
);

/**
 * DRL 可视化组件注册表
 * 键为题目 ID，值为懒加载的 React 组件
 */
export const drlVisualizerRegistry: Record<number, ComponentType> = {};

export function getDrlVisualizer(id: number): ComponentType {
  return drlVisualizerRegistry[id] ?? GuidedDRLLessonVisualizer;
}
