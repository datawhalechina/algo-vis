/**
 * 题目可视化组件注册中心
 * 
 * 这个文件用于统一管理所有题目的可视化组件映射
 * 使用懒加载优化初始加载时间，只在用户访问具体题目时才加载对应组件
 */

import { ComponentType, lazy } from 'react';

/**
 * 懒加载可视化组件注册表
 * 使用 React.lazy 实现按需加载，减少初始包体积
 * 
 * key: 题目 ID
 * value: 懒加载的可视化组件
 */
export const visualizerRegistry: Record<number, ComponentType> = {
  1: lazy(() => import('./TwoSum/TwoSumVisualizer')),
  2: lazy(() => import('./ReverseLinkedList/ReverseLinkedListVisualizer')),
  3: lazy(() => import('./MergeSortedArray/MergeSortedArrayVisualizer')),
  4: lazy(() => import('./ValidParentheses/ValidParenthesesVisualizer')),
  5: lazy(() => import('./ClimbingStairs/ClimbingStairsVisualizer')),
  6: lazy(() => import('./ContainerWithMostWater/ContainerVisualizer')),
  7: lazy(() => import('./MoveZeroes/MoveZeroesVisualizer')),
  8: lazy(() => import('./BestTimeToBuyStock/BestTimeToBuyStockVisualizer')),
  9: lazy(() => import('./LongestCommonPrefix/LongestCommonPrefixVisualizer')),
  10: lazy(() => import('./MaxSubArray/MaxSubArrayVisualizer')),
  // 添加新题目时，在这里注册：
  // 11: lazy(() => import('./NextProblem/NextProblemVisualizer')),
};

/**
 * 检查题目是否有可视化组件
 */
export function hasVisualizer(problemId: number): boolean {
  return problemId in visualizerRegistry;
}

/**
 * 获取题目的可视化组件（懒加载）
 * 返回的组件需要用 Suspense 包裹
 */
export function getVisualizer(problemId: number): ComponentType | null {
  return visualizerRegistry[problemId] || null;
}
