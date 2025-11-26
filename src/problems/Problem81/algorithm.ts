import { VisualizationStep } from "@/types";

/**
 * LeetCode 114: 二叉树展开为链表
 * 难度：中等
 * 
 * 给你二叉树的根结点 root ，请你将它展开为一个单链表：
 * - 展开后的单链表应该同样使用 TreeNode，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null。
 * - 展开后的单链表应该与二叉树前序遍历顺序相同。
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

function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === null || node === undefined) {
      result.push(null);
    } else {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    }
  }

  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

export function generateFlattenSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: "🔗 开始展开二叉树为链表（前序遍历顺序）",
    data: { tree: arr },
    variables: { preorderPath: [] }
  });

  const root = buildTree(arr);
  if (!root) {
    steps.push({
      id: stepId++,
      description: "树为空",
      data: { tree: arr },
      variables: {}
    });
    return steps;
  }

  // 前序遍历收集节点
  const preorder: number[] = [];
  function collectPreorder(node: TreeNode | null): void {
    if (!node) return;
    preorder.push(node.val);
    collectPreorder(node.left);
    collectPreorder(node.right);
  }
  collectPreorder(root);

  steps.push({
    id: stepId++,
    description: `📋 前序遍历顺序：[${preorder.join(' → ')}]（这就是最终链表的顺序）`,
    data: { tree: arr },
    variables: { preorder: [...preorder], preorderPath: [...preorder] }
  });

  // 展开过程
  function flatten(node: TreeNode | null): void {
    if (!node) return;

    steps.push({
      id: stepId++,
      description: `🔄 处理节点 ${node.val} - 检查是否有左子树需要移动`,
      data: { tree: treeToArray(root) },
      variables: { currentNode: node.val, preorder, preorderPath: [...preorder] }
    });

    const leftSubtree = node.left;
    const rightSubtree = node.right;

    // 递归展开左右子树
    flatten(leftSubtree);
    flatten(rightSubtree);

    // 将左子树接到右子树位置
    if (leftSubtree) {
      steps.push({
        id: stepId++,
        description: `➡️ 步骤1：将节点 ${node.val} 的左子树移到右侧`,
        data: { tree: treeToArray(root) },
        variables: { currentNode: node.val, moving: true, step: 'move-left-to-right', preorderPath: [...preorder] }
      });

      node.right = leftSubtree;
      node.left = null;

      // 找到左子树的最右节点
      let rightmost = leftSubtree;
      while (rightmost.right) {
        rightmost = rightmost.right;
      }

      // 将原右子树接到左子树的最右节点后面
      if (rightSubtree) {
        steps.push({
          id: stepId++,
          description: `🔗 步骤2：将原右子树接到 ${rightmost.val} 的右侧`,
          data: { tree: treeToArray(root) },
          variables: { currentNode: node.val, rightmostNode: rightmost.val, connecting: true, step: 'connect-right', preorderPath: [...preorder] }
        });
        rightmost.right = rightSubtree;
      }

      steps.push({
        id: stepId++,
        description: `✅ 节点 ${node.val} 处理完成！左子树已移动，左指针置空`,
        data: { tree: treeToArray(root) },
        variables: { currentNode: node.val, completed: true, preorderPath: [...preorder] }
      });
    }
  }

  flatten(root);

  steps.push({
    id: stepId++,
    description: `🎉 展开完成！现在所有节点都在右侧链上，顺序为: [${preorder.join(' → ')}]`,
    data: { tree: treeToArray(root) },
    variables: { finalResult: preorder, preorderPath: [...preorder] }
  });

  return steps;
}
