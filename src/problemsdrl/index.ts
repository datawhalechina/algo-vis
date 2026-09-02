import { ComponentType, lazy } from "react";
import { GUIDED_LESSON_MANIFEST } from "@/config/guidedLessonManifest";

const GuidedDRLLessonVisualizer = lazy(
  () => import("@/components/visualizers/GuidedDRLLessonVisualizer"),
);

/**
 * DRL 可视化组件注册表
 * 键为题目 ID，值为懒加载的 React 组件
 */
export const drlVisualizerRegistry: Record<number, ComponentType> = {};

export function getDrlVisualizer(id: number): ComponentType | null {
  return drlVisualizerRegistry[id]
    ?? (GUIDED_LESSON_MANIFEST.drl.includes(id) ? GuidedDRLLessonVisualizer : null);
}
