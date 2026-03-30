import { ComponentType, lazy } from "react";

/**
 * DRL 可视化组件注册表
 * 键为题目 ID，值为懒加载的 React 组件
 */
export const drlVisualizerRegistry: Record<number, ComponentType> = {
  // verl 框架系列 (30030-30036)
  30030: lazy(() => import("./Problemdrl30030/VerlOverviewVisualizer")),
  30031: lazy(() => import("./Problemdrl30031/SingleControllerVisualizer")),
  30032: lazy(() => import("./Problemdrl30032/PPOTrainingLoopVisualizer")),
  30033: lazy(() => import("./Problemdrl30033/ActorRolloutVisualizer")),
  30034: lazy(() => import("./Problemdrl30034/CriticAdvantageVisualizer")),
  30035: lazy(() => import("./Problemdrl30035/RewardModuleVisualizer")),
  30036: lazy(() => import("./Problemdrl30036/HybridEngineVisualizer")),
};

export function getDrlVisualizer(id: number): ComponentType | undefined {
  return drlVisualizerRegistry[id];
}
