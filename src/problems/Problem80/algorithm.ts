import { VisualizationStep } from "@/types";

/**
 * LeetCode 199: 二叉树的右视图
 * 难度：中等
 * 
 * 给定一个二叉树的根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。
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

export function generateRightSideViewSteps(arr: (number | null)[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: "🔍 开始层序遍历（BFS），每层只保留最右侧节点",
    data: { tree: arr },
    variables: { result: [], rightView: [] }
  });

  const root = buildTree(arr);
  if (!root) {
    steps.push({
      id: stepId++,
      description: "树为空",
      data: { tree: arr },
      variables: { result: [] }
    });
    return steps;
  }

  const result: number[] = [];
  const queue: TreeNode[] = [root];
  let level = 0;

  while (queue.length > 0) {
    const levelSize = queue.length;
    
    const currentLevelNodes = queue.map(n => n.val);
    steps.push({
      id: stepId++,
      description: `📍 第 ${level + 1} 层：共 ${levelSize} 个节点 [${currentLevelNodes.join(', ')}]`,
      data: { tree: arr },
      variables: { level: level + 1, levelSize, currentLevel: currentLevelNodes, result: [...result], rightView: [...result] }
    });

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      
      const isRightmost = i === levelSize - 1;
      steps.push({
        id: stepId++,
        description: `${isRightmost ? '👁️' : '➡️'} 访问节点 ${node.val}${isRightmost ? ' ✨ 这是本层最右侧！' : ''}`,
        data: { tree: arr },
        variables: { 
          level: level + 1, 
          currentNode: node.val,
          isRightmost,
          result: [...result],
          rightView: [...result]
        }
      });

      // 如果是该层最后一个节点（最右侧），加入结果
      if (isRightmost) {
        result.push(node.val);
        steps.push({
          id: stepId++,
          description: `✅ 将节点 ${node.val} 加入右视图 → 当前结果: [${result.join(', ')}]`,
          data: { tree: arr },
          variables: { 
            level: level + 1,
            rightmostNode: node.val,
            result: [...result],
            rightView: [...result]
          }
        });
      }

      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    level++;
  }

  steps.push({
    id: stepId++,
    description: `🎉 完成遍历！右视图为：[${result.join(', ')}]`,
    data: { tree: arr },
    variables: { finalResult: result, rightView: result }
  });

  return steps;
}
