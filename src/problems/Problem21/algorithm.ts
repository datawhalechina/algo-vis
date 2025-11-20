import { VisualizationStep } from "@/types";

// 二叉树节点定义
export interface TreeNode {
  val: number;
  index: number; // 节点在数组中的索引
  left: TreeNode | null;
  right: TreeNode | null;
}

// 从数组构建二叉树（LeetCode格式：[3,9,20,null,null,15,7]）
export function buildTreeFromArray(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;

  const root: TreeNode = { val: arr[0], index: 0, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    // 左子节点
    if (i < arr.length && arr[i] !== null) {
      const left: TreeNode = {
        val: arr[i]!,
        index: i,
        left: null,
        right: null,
      };
      node.left = left;
      queue.push(left);
    }
    i++;

    // 右子节点
    if (i < arr.length && arr[i] !== null) {
      const right: TreeNode = {
        val: arr[i]!,
        index: i,
        left: null,
        right: null,
      };
      node.right = right;
      queue.push(right);
    }
    i++;
  }

  return root;
}

// 将树转换回数组（用于调试或展示）
export function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }

  // 去除末尾的 null
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

export interface MaxDepthData {
  tree: (number | null)[];
  currentNodeIndex: number | null; // 当前节点索引
  currentNodeVal: number | null; // 当前节点值
  currentLevel: number; // 当前递归层级（从1开始）
  calculatedDepths: Record<number, number>; // 已计算出的节点最大深度：index -> depth
  phase: "visit" | "leaf" | "backtrack" | "finished"; // 当前阶段
  compareInfo?: {
    leftDepth: number;
    rightDepth: number;
    max: number;
  };
}

// 递归计算最大深度（带可视化步骤）
export function generateMaxDepthSteps(
  root: TreeNode | null,
  arr: (number | null)[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const calculatedDepths: Record<number, number> = {};

  // 辅助函数：递归计算深度并生成步骤
  function maxDepth(
    node: TreeNode | null,
    level: number, // 当前在第几层
    path: number[] // 记录路径上的节点索引
  ): number {
    // Base case: 节点为空
    if (!node) {
      return 0;
    }

    const currentPath = [...path, node.index];

    // 步骤：访问节点
    steps.push({
      id: stepId++,
      description: `访问节点 ${node.val} (索引 ${node.index})，当前位于第 ${level} 层`,
      data: {
        tree: arr,
        currentNodeIndex: node.index,
        currentNodeVal: node.val,
        currentLevel: level,
        calculatedDepths: { ...calculatedDepths },
        phase: "visit",
      } as MaxDepthData,
      highlightedNodes: currentPath.map(String), // 使用索引作为ID
    });

    // 如果是叶子节点
    if (!node.left && !node.right) {
      calculatedDepths[node.index] = 1;
      steps.push({
        id: stepId++,
        description: `节点 ${node.val} 是叶子节点，返回深度 1`,
        data: {
          tree: arr,
          currentNodeIndex: node.index,
          currentNodeVal: node.val,
          currentLevel: level,
          calculatedDepths: { ...calculatedDepths },
          phase: "leaf",
        } as MaxDepthData,
        highlightedNodes: currentPath.map(String),
      });
      return 1;
    }

    // 递归左子树
    const leftDepth = maxDepth(node.left, level + 1, currentPath);

    // 递归右子树
    const rightDepth = maxDepth(node.right, level + 1, currentPath);

    // 计算当前最大深度
    const max = Math.max(leftDepth, rightDepth) + 1;
    calculatedDepths[node.index] = max;

    // 步骤：回溯并计算
    steps.push({
      id: stepId++,
      description: `回到节点 ${node.val}：左子树深度 ${leftDepth}，右子树深度 ${rightDepth}。max(${leftDepth}, ${rightDepth}) + 1 = ${max}`,
      data: {
        tree: arr,
        currentNodeIndex: node.index,
        currentNodeVal: node.val,
        currentLevel: level,
        calculatedDepths: { ...calculatedDepths },
        phase: "backtrack",
        compareInfo: {
          leftDepth,
          rightDepth,
          max,
        },
      } as MaxDepthData,
      variables: {
        leftDepth,
        rightDepth,
        currentMax: max,
      },
      highlightedNodes: currentPath.map(String),
    });

    return max;
  }

  if (!root) {
    steps.push({
      id: stepId++,
      description: "树为空，深度为 0",
      data: {
        tree: [],
        currentNodeIndex: null,
        currentNodeVal: null,
        currentLevel: 0,
        calculatedDepths: {},
        phase: "finished",
      } as MaxDepthData,
    });
    return steps;
  }

  const result = maxDepth(root, 1, []);

  steps.push({
    id: stepId++,
    description: `计算完成，二叉树的最大深度为 ${result}`,
    data: {
      tree: arr,
      currentNodeIndex: null,
      currentNodeVal: null,
      currentLevel: 0,
      calculatedDepths: { ...calculatedDepths },
      phase: "finished",
    } as MaxDepthData,
    variables: { maxDepth: result },
  });

  return steps;
}
