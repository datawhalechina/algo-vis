import { VisualizationStep } from "@/types";

/**
 * 生成二叉树中的最大路径和算法步骤
 * 时间复杂度：O(n)
 * 空间复杂度：O(h)，h为树的高度
 */
export function generateMaxPathSumSteps(
  tree: (number | null)[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let maxSum = -Infinity;
  let maxPathNodes: number[] = [];

  steps.push({
    id: steps.length,
    description: "开始计算二叉树的最大路径和",
    data: { tree },
    variables: { maxSum: -Infinity },
  });

  function dfs(index: number): number {
    if (index >= tree.length || tree[index] === null) {
      return 0;
    }

    const val = tree[index]!;
    const leftIndex = 2 * index + 1;
    const rightIndex = 2 * index + 2;

    steps.push({
      id: steps.length,
      description: `访问节点 ${val}`,
      data: { tree },
      variables: {
        currentNode: val,
        currentIndex: index,
        maxSum: maxSum === -Infinity ? "未初始化" : maxSum,
      },
    });

    // 递归计算左右子树的最大贡献值
    const leftGain = Math.max(dfs(leftIndex), 0);
    const rightGain = Math.max(dfs(rightIndex), 0);

    // 当前节点的最大路径和
    const currentPathSum = val + leftGain + rightGain;

    // 更新全局最大路径和
    if (currentPathSum > maxSum) {
      maxSum = currentPathSum;
      maxPathNodes = [val];
      
      // 添加左子树贡献的节点
      if (leftGain > 0 && leftIndex < tree.length && tree[leftIndex] !== null) {
        maxPathNodes.push(tree[leftIndex]!);
      }
      
      // 添加右子树贡献的节点
      if (rightGain > 0 && rightIndex < tree.length && tree[rightIndex] !== null) {
        maxPathNodes.push(tree[rightIndex]!);
      }

      steps.push({
        id: steps.length,
        description: `更新最大路径和为 ${maxSum}（经过节点 ${val}）`,
        data: { tree },
        variables: {
          currentNode: val,
          currentIndex: index,
          leftGain,
          rightGain,
          currentPathSum,
          maxSum,
          maxPathNodes: [...maxPathNodes],
          isNewMax: true,
        },
      });
    } else {
      steps.push({
        id: steps.length,
        description: `节点 ${val} 的路径和为 ${currentPathSum}，不更新最大值`,
        data: { tree },
        variables: {
          currentNode: val,
          currentIndex: index,
          leftGain,
          rightGain,
          currentPathSum,
          maxSum,
        },
      });
    }

    // 返回当前节点的最大贡献值
    return val + Math.max(leftGain, rightGain);
  }

  dfs(0);

  steps.push({
    id: steps.length,
    description: `完成！最大路径和为 ${maxSum}`,
    data: { tree },
    variables: {
      maxSum,
      maxPathNodes,
      result: maxSum,
      completed: true,
    },
  });

  return steps;
}
