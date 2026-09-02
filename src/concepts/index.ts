/**
 * 概念可视化组件注册中心
 *
 * 这个文件用于统一管理所有概念的可视化组件映射
 * 使用懒加载优化初始加载时间，只在用户访问具体概念时才加载对应组件
 */

import { ComponentType, lazy } from "react";
import { GUIDED_LESSON_MANIFEST } from "@/config/guidedLessonManifest";

const GuidedConceptLessonVisualizer = lazy(
  () => import("@/components/visualizers/GuidedConceptLessonVisualizer"),
);

/**
 * 懒加载可视化组件注册表
 * 使用 React.lazy 实现按需加载，减少初始包体积
 *
 * key: 概念 ID
 * value: 懒加载的可视化组件
 */
export const conceptVisualizerRegistry: Record<number, ComponentType> = {
};

export function getConceptVisualizer(id: number): ComponentType | null {
  return conceptVisualizerRegistry[id]
    ?? (GUIDED_LESSON_MANIFEST.concepts.includes(id) ? GuidedConceptLessonVisualizer : null);
}
