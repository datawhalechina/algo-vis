import { VisualizationStep } from "@/types";

/**
 * LeetCode 230: 二叉搜索树中第K小的元素
 * 难度：中等
 * 
 * 给定一个二叉搜索树的根节点 root ，和一个整数 k ，请你设计一个算法查找其中第 k 个最小元素（从 1 开始计数）。
 */

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/**
 * 从数组构建二叉树
 */
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

/**
 * 生成第K小的元素可视化步骤
 */
export function generateKthSmallestSteps(arr: (number | null)[], k: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  
  steps.push({
    id: stepId++,
    description: `开始查找第 ${k} 小的元素（使用中序遍历）`,
    data: { tree: arr },
    variables: { k, count: 0, result: null }
  });

  const root = buildTree(arr);
  if (!root) {
    steps.push({
      id: stepId++,
      description: "树为空",
      data: { tree: arr },
      variables: { k, count: 0, result: null }
    });
    return steps;
  }

  let count = 0;
  let result: number | null = null;
  const visitedPath: number[] = []; // 记录访问路径

  function inorder(node: TreeNode | null, nodeVal: number | null): void {
    if (node === null || result !== null) return;

    // 访问左子树
    if (node.left) {
      steps.push({
        id: stepId++,
        description: `📍 向左：准备访问节点 ${nodeVal} 的左子树（值为 ${node.left.val}）`,
        data: { tree: arr },
        variables: { k, count, currentNode: node.left.val, traversing: "left", visitedPath: [...visitedPath] }
      });
      inorder(node.left, node.left.val);
    }

    // 访问当前节点
    if (result === null) {
      count++;
      visitedPath.push(nodeVal!);
      steps.push({
        id: stepId++,
        description: `✅ 访问节点 ${nodeVal}（中序遍历第 ${count} 个）- ${count === k ? '🎯 这就是答案！' : count < k ? '继续查找...' : ''}`,
        data: { tree: arr },
        variables: { k, count, currentNode: nodeVal, visiting: true, visitedPath: [...visitedPath] }
      });

      if (count === k) {
        result = nodeVal!;
        steps.push({
          id: stepId++,
          description: `🎉 找到第 ${k} 小的元素：${result}`,
          data: { tree: arr },
          variables: { k, count, result, currentNode: nodeVal, found: true, visitedPath: [...visitedPath] }
        });
        return;
      }
    }

    // 访问右子树
    if (node.right && result === null) {
      steps.push({
        id: stepId++,
        description: `📍 向右：准备访问节点 ${nodeVal} 的右子树（值为 ${node.right.val}）`,
        data: { tree: arr },
        variables: { k, count, currentNode: node.right.val, traversing: "right", visitedPath: [...visitedPath] }
      });
      inorder(node.right, node.right.val);
    }
  }

  inorder(root, root.val);

  if (result !== null) {
    steps.push({
      id: stepId++,
      description: `第 ${k} 小的元素是 ${result}`,
      data: { tree: arr },
      variables: { k, count, result, finalResult: result }
    });
  }

  return steps;
}
