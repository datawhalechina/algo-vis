/**
 * 题目可视化组件注册中心
 *
 * 这个文件用于统一管理所有题目的可视化组件映射
 * 使用懒加载优化初始加载时间，只在用户访问具体题目时才加载对应组件
 */

import { ComponentType, lazy } from "react";

/**
 * 懒加载可视化组件注册表
 * 使用 React.lazy 实现按需加载，减少初始包体积
 *
 * key: 题目 ID
 * value: 懒加载的可视化组件
 */
export const visualizerRegistry: Record<number, ComponentType> = {
  1: lazy(() => import("./Problem1/TwoSumVisualizer")),
  2: lazy(() => import("./Problem2/ReverseLinkedListVisualizer")),
  3: lazy(() => import("./Problem3/MergeSortedArrayVisualizer")),
  4: lazy(() => import("./Problem4/ValidParenthesesVisualizer")),
  5: lazy(() => import("./Problem5/ClimbingStairsVisualizer")),
  6: lazy(() => import("./Problem6/ContainerVisualizer")),
  7: lazy(() => import("./Problem7/MoveZeroesVisualizer")),
  8: lazy(() => import("./Problem8/BestTimeToBuyStockVisualizer")),
  9: lazy(() => import("./Problem9/LongestCommonPrefixVisualizer")),
  10: lazy(() => import("./Problem10/MaxSubArrayVisualizer")),
  11: lazy(() => import("./Problem11/PalindromeNumberVisualizer")),
  12: lazy(() => import("./Problem12/MergeTwoListsVisualizer")),
  13: lazy(() => import("./Problem13/RemoveDuplicatesVisualizer")),
  14: lazy(() => import("./Problem14/SearchInsertVisualizer")),
  15: lazy(() => import("./Problem15/PlusOneVisualizer")),
  16: lazy(() => import("./Problem16/TwoSumIIVisualizer")),
  17: lazy(() => import("./Problem17/PascalTriangleVisualizer")),
  18: lazy(() => import("./Problem18/BestTimeToBuyStockIIVisualizer")),
  19: lazy(() => import("./Problem19/MajorityElementVisualizer")),
  20: lazy(() => import("./Problem20/ReverseStringVisualizer")),
  21: lazy(() => import("./Problem21/MaxDepthOfBinaryTreeVisualizer")),
  22: lazy(() => import("./Problem22/NumberOfIslandsVisualizer")),
  23: lazy(() => import("./Problem23/SingleNumberVisualizer")),
  24: lazy(() => import("./Problem24/HappyNumberVisualizer")),
  25: lazy(() => import("./Problem25/CountPrimesVisualizer")),
  26: lazy(() => import("./Problem26/IsomorphicStringsVisualizer")),
  27: lazy(() => import("./Problem27/ContainsDuplicateVisualizer")),
  28: lazy(() => import("./Problem28/ContainsDuplicateIIVisualizer")),
  29: lazy(() => import("./Problem29/PowerOfThreeVisualizer")),
  30: lazy(() => import("./Problem30/ReverseBitsVisualizer")),
  31: lazy(() => import("./Problem31/NextPermutationVisualizer")),
  32: lazy(() => import("./Problem32/LongestValidParenthesesVisualizer")),
  33: lazy(() => import("./Problem33/SearchRotatedArrayVisualizer")),
  34: lazy(() => import("./Problem34/SearchRangeVisualizer")),
  35: lazy(() => import("./Problem35/ValidSudokuVisualizer")),
  36: lazy(() => import("./Problem36/CombinationSumVisualizer")),
  37: lazy(() => import("./Problem37/FirstMissingPositiveVisualizer")),
  38: lazy(() => import("./Problem38/TrappingRainWaterVisualizer")),
  39: lazy(() => import("./Problem39/PermutationsVisualizer")),
  40: lazy(() => import("./Problem40/PermutationsIIVisualizer")),
  41: lazy(() => import("./Problem41/GroupAnagramsVisualizer")),
  42: lazy(() => import("./Problem42/LongestConsecutiveVisualizer")),
  43: lazy(() => import("./Problem43/ThreeSumVisualizer")),
  44: lazy(() => import("./Problem44/LengthOfLongestSubstringVisualizer")),
  45: lazy(() => import("./Problem45/FindAnagramsVisualizer")),
  46: lazy(() => import("./Problem46/SubarraySumVisualizer")),
  47: lazy(() => import("./Problem47/MergeIntervalsVisualizer")),
  48: lazy(() => import("./Problem48/RotateArrayVisualizer")),
  49: lazy(() => import("./Problem49/MaxSlidingWindowVisualizer")),
  50: lazy(() => import("./Problem50/MinWindowVisualizer")),
  51: lazy(() => import("./Problem51/ProductExceptSelfVisualizer")),
  52: lazy(() => import("./Problem52/SetMatrixZeroesVisualizer")),
  53: lazy(() => import("./Problem53/SpiralMatrixVisualizer")),
  54: lazy(() => import("./Problem54/RotateImageVisualizer")),
  55: lazy(() => import("./Problem55/SearchMatrix2Visualizer")),
  56: lazy(() => import("./Problem56/IntersectionListVisualizer")),
  57: lazy(() => import("./Problem57/PalindromeListVisualizer")),
  58: lazy(() => import("./Problem58/HasCycleVisualizer")),
  59: lazy(() => import("./Problem59/DetectCycleVisualizer")),
  60: lazy(() => import("./Problem60/AddTwoNumbersVisualizer")),
  61: lazy(() => import("./Problem61/RemoveNthFromEndVisualizer")),
  // 链表题目 (Problem 62-67)
  62: lazy(() => import("./Problem62/SwapPairsVisualizer")),
  63: lazy(() => import("./Problem63/ReverseKGroupVisualizer")),
  64: lazy(() => import("./Problem64/CopyRandomListVisualizer")),
  65: lazy(() => import("./Problem65/SortListVisualizer")),
  66: lazy(() => import("./Problem66/MergeKListsVisualizer")),
  67: lazy(() => import("./Problem67/LRUCacheVisualizer")),
  // 二叉树题目 (Problem 68)
  68: lazy(() => import("./Problem68/InorderTraversalVisualizer")),
  // 新增题目 (Problem 69-78)
  69: lazy(() => import("./Problem69/GroupAnagramsVisualizer")),
  70: lazy(() => import("./Problem70/LongestConsecutiveVisualizer")),
  71: lazy(() => import("./Problem71/ThreeSumVisualizer")),
  72: lazy(() => import("./Problem72/InvertTreeVisualizer")),
  73: lazy(() => import("./Problem73/MaxSlidingWindowVisualizer")),
  74: lazy(() => import("./Problem74/IsSymmetricVisualizer")),
  75: lazy(() => import("./Problem75/DiameterOfBinaryTreeVisualizer")),
  76: lazy(() => import("./Problem76/LevelOrderVisualizer")),
  77: lazy(() => import("./Problem77/SortedArrayToBSTVisualizer")),
  78: lazy(() => import("./Problem78/IsValidBSTVisualizer")),
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
