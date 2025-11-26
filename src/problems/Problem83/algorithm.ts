import { VisualizationStep } from "@/types";

/**
 * LeetCode 437: 路径总和 III
 * 难度：中等
 * 
 * 给定一个二叉树的根节点 root ，和一个整数 targetSum ，求该二叉树里节点值之和等于 targetSum 的路径的数目。
 * 路径不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。
 */

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function buildTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;

  const root: TreeNode = { val: arr[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i]!, left: null, right: null };
      queue.push(node.left);
    }
    i++;

    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i]!, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }

  return root;
}

export function generatePathSumSteps(arr: (number | null)[], targetSum: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  let totalPaths = 0;

  steps.push({
    id: stepId++,
    description: `🎯 开始查找路径总和为 ${targetSum} 的路径（路径可从任意节点开始）`,
    data: { tree: arr },
    variables: { targetSum, totalPaths: 0, foundPaths: [] }
  });

  const root = buildTree(arr);
  if (!root) {
    steps.push({
      id: stepId++,
      description: "树为空",
      data: { tree: arr },
      variables: { targetSum, totalPaths: 0 }
    });
    return steps;
  }

  // 从某个节点开始向下寻找路径
  function findPaths(node: TreeNode | null, currentSum: number, path: number[]): number {
    if (!node) return 0;

    const newPath = [...path, node.val];
    const newSum = currentSum + node.val;
    let count = 0;

    steps.push({
      id: stepId++,
      description: `📍 访问节点 ${node.val} → 路径: [${newPath.join(' → ')}], 累计和: ${newSum}${newSum === targetSum ? ' ✅ 找到了！' : ''}`,
      data: { tree: arr },
      variables: { 
        currentNode: node.val,
        currentPath: newPath,
        currentSum: newSum,
        targetSum,
        totalPaths,
        isMatch: newSum === targetSum
      }
    });

    // 检查当前路径是否满足条件
    if (newSum === targetSum) {
      count++;
      totalPaths++;
      steps.push({
        id: stepId++,
        description: `🎉 找到第 ${totalPaths} 条路径: [${newPath.join(' → ')}] = ${targetSum}`,
        data: { tree: arr },
        variables: { 
          foundPath: newPath,
          currentNode: node.val,
          totalPaths,
          pathSum: newSum
        }
      });
    }

    // 继续向下搜索
    count += findPaths(node.left, newSum, newPath);
    count += findPaths(node.right, newSum, newPath);

    return count;
  }

  // DFS遍历每个节点作为起点
  function dfs(node: TreeNode | null): number {
    if (!node) return 0;

    steps.push({
      id: stepId++,
      description: `🔍 以节点 ${node.val} 为起点开始新的搜索（已找到 ${totalPaths} 条路径）`,
      data: { tree: arr },
      variables: { 
        startNode: node.val,
        targetSum,
        totalPaths,
        searching: true
      }
    });

    // 从当前节点开始的所有路径
    const pathsFromNode = findPaths(node, 0, []);

    // 递归遍历左右子树
    const pathsFromLeft = dfs(node.left);
    const pathsFromRight = dfs(node.right);

    return pathsFromNode + pathsFromLeft + pathsFromRight;
  }

  const result = dfs(root);

  steps.push({
    id: stepId++,
    description: `🎉 完成搜索！共找到 ${result} 条路径总和为 ${targetSum} 的路径`,
    data: { tree: arr },
    variables: { finalResult: result, totalPaths: result, targetSum }
  });

  return steps;
}
