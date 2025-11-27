import { Problem, Difficulty, Category, SolutionMethod } from "@/types";
import { arrayProblems } from "./array";
import { stringProblems } from "./string";
import { linkedListProblems } from "./linkedList";
import { mathProblems } from "./math";
import { treeProblems } from "./tree";
import { graphProblems } from "./graph";
import { backtrackingProblems } from "./backtracking";
import { binarySearchProblems } from "./binarySearch";
import { stackProblems } from "./stack";

/**
 * 合并所有题目数据
 */
export const problems: Problem[] = [
  ...arrayProblems,
  ...stringProblems,
  ...linkedListProblems,
  ...mathProblems,
  ...treeProblems,
  ...graphProblems,
  ...backtrackingProblems,
  ...binarySearchProblems,
  ...stackProblems,
].sort((a, b) => a.id - b.id);

/**
 * 按题型导出
 */
export {
  arrayProblems,
  stringProblems,
  linkedListProblems,
  mathProblems,
  treeProblems,
  graphProblems,
  backtrackingProblems,
  binarySearchProblems,
  stackProblems,
};

/**
 * 工具函数
 */
export const getProblemById = (id: number): Problem | undefined => {
  return problems.find((p) => p.id === id);
};

export const getProblemsByCategory = (category: Category): Problem[] => {
  return problems.filter((p) => p.category.includes(category));
};

export const getProblemsByDifficulty = (difficulty: Difficulty): Problem[] => {
  return problems.filter((p) => p.difficulty === difficulty);
};

// 获取所有分类及其题目数量（题型分类）
export const getCategoryStats = () => {
  const stats = new Map<Category, number>();
  problems.forEach((problem) => {
    problem.category.forEach((cat) => {
      stats.set(cat, (stats.get(cat) || 0) + 1);
    });
  });
  return stats;
};

// 获取所有解决方式及其题目数量
export const getMethodStats = () => {
  const stats = new Map<SolutionMethod, number>();
  problems.forEach((problem) => {
    problem.methods.forEach((method) => {
      stats.set(method, (stats.get(method) || 0) + 1);
    });
  });
  return stats;
};

// 分类中文名称映射（题型）
export const categoryNames: Record<Category, string> = {
  [Category.ARRAY]: "数组",
  [Category.STRING]: "字符串",
  [Category.LINKED_LIST]: "链表",
  [Category.TREE]: "树",
  [Category.GRAPH]: "图",
  [Category.HASH_TABLE]: "哈希表",
  [Category.STACK]: "栈",
  [Category.QUEUE]: "队列",
  [Category.HEAP]: "堆",
  [Category.MATH]: "数学",
  [Category.MATRIX]: "矩阵",
};

// 解决方式中文名称映射
export const methodNames: Record<SolutionMethod, string> = {
  [SolutionMethod.DYNAMIC_PROGRAMMING]: "动态规划",
  [SolutionMethod.GREEDY]: "贪心算法",
  [SolutionMethod.BACKTRACKING]: "回溯",
  [SolutionMethod.BINARY_SEARCH]: "二分查找",
  [SolutionMethod.TWO_POINTERS]: "双指针",
  [SolutionMethod.SLIDING_WINDOW]: "滑动窗口",
  [SolutionMethod.DIVIDE_CONQUER]: "分治",
  [SolutionMethod.SORTING]: "排序",
  [SolutionMethod.BIT_MANIPULATION]: "位运算",
  [SolutionMethod.DFS]: "深度优先搜索",
  [SolutionMethod.BFS]: "广度优先搜索",
  [SolutionMethod.RECURSION]: "递归",
  [SolutionMethod.ITERATION]: "迭代",
};
