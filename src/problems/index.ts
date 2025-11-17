/**
 * 题目可视化组件注册中心
 * 
 * 这个文件用于统一管理所有题目的可视化组件映射
 * 添加新题目时，只需在这里注册组件即可，无需修改 ProblemPage
 */

import { ComponentType } from 'react';

// 导入所有可视化组件
import TwoSumVisualizer from './TwoSum/TwoSumVisualizer';
import ReverseLinkedListVisualizer from './ReverseLinkedList/ReverseLinkedListVisualizer';
import MergeSortedArrayVisualizer from './MergeSortedArray/MergeSortedArrayVisualizer';
import ValidParenthesesVisualizer from './ValidParentheses/ValidParenthesesVisualizer';
import ContainerVisualizer from './ContainerWithMostWater/ContainerVisualizer';
import MoveZeroesVisualizer from './MoveZeroes/MoveZeroesVisualizer';
import ClimbingStairsVisualizer from './ClimbingStairs/ClimbingStairsVisualizer';

/**
 * 可视化组件注册表
 * key: 题目 ID
 * value: 对应的可视化组件
 * 
 * 使用方式：
 * const VisualizerComponent = visualizerRegistry[problemId];
 * <VisualizerComponent />
 */
export const visualizerRegistry: Record<number, ComponentType> = {
  1: TwoSumVisualizer,
  2: ReverseLinkedListVisualizer,
  3: MergeSortedArrayVisualizer,
  4: ValidParenthesesVisualizer,
  5: ClimbingStairsVisualizer,
  6: ContainerVisualizer,
  7: MoveZeroesVisualizer,
  // 添加新题目时，在这里注册：
  // 8: NextProblemVisualizer,
};

/**
 * 懒加载版本的组件注册表（用于性能优化）
 * 当题目数量增多时，可以切换到这个版本以减少初始加载时间
 */
export const lazyVisualizerRegistry: Record<number, ComponentType> = {
  // 示例：
  // 1: lazy(() => import('./TwoSum/TwoSumVisualizer')),
  // 2: lazy(() => import('./ReverseLinkedList/ReverseLinkedListVisualizer')),
};

/**
 * 检查题目是否有可视化组件
 */
export function hasVisualizer(problemId: number): boolean {
  return problemId in visualizerRegistry;
}

/**
 * 获取题目的可视化组件
 */
export function getVisualizer(problemId: number): ComponentType | null {
  return visualizerRegistry[problemId] || null;
}
