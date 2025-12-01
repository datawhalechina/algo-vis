import { VisualizationStep } from "@/types";

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function generatePathSumIIISteps(
  root: TreeNode | null,
  targetSum: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  let totalCount = 0;

  // 从当前节点出发的路径数
  const findPaths = (
    node: TreeNode | null,
    sum: number,
    path: number[],
    currentPath: number[]
  ): number => {
    if (!node) {
      return 0;
    }

    const newSum = sum - node.val;
    const newPath = [...currentPath, node.val];

    steps.push({
      id: stepId++,
      description: `从节点 ${node.val} 出发，剩余目标和 = ${sum} - ${node.val} = ${newSum}`,
      data: { node: { ...node }, sum, newSum, path, currentPath: newPath },
      variables: {
        node: { ...node },
        sum,
        newSum,
        path,
        currentPath: newPath,
        phase: "find_paths",
      },
    });

    let count = 0;
    if (node.val === sum) {
      count++;
      steps.push({
        id: stepId++,
        description: `找到路径！路径和 = ${newPath.join(" + ")} = ${sum}`,
        data: { node: { ...node }, sum, path, currentPath: newPath, found: true },
        variables: {
          node: { ...node },
          sum,
          path,
          currentPath: newPath,
          found: true,
          phase: "found_path",
        },
      });
    }

    count += findPaths(node.left, newSum, path, newPath);
    count += findPaths(node.right, newSum, path, newPath);

    return count;
  };

  // 遍历每个节点作为起点
  const pathSum = (node: TreeNode | null, path: number[]): number => {
    if (!node) {
      return 0;
    }

    steps.push({
      id: stepId++,
      description: `以节点 ${node.val} 为起点搜索路径`,
      data: { node: { ...node }, path, targetSum },
      variables: { node: { ...node }, path, targetSum, phase: "start_from_node" },
    });

    const count = findPaths(node, targetSum, path, []);
    totalCount += count;

    steps.push({
      id: stepId++,
      description: `从节点 ${node.val} 出发找到 ${count} 条路径，累计 ${totalCount} 条`,
      data: { node: { ...node }, path, count, totalCount },
      variables: { node: { ...node }, path, count, totalCount, phase: "count_paths" },
    });

    const leftCount = pathSum(node.left, [...path, 0]);
    const rightCount = pathSum(node.right, [...path, 1]);

    return count + leftCount + rightCount;
  };

  if (root) {
    steps.push({
      id: stepId++,
      description: `开始搜索，目标和 = ${targetSum}`,
      data: { node: { ...root }, targetSum, path: [] },
      variables: { node: { ...root }, targetSum, path: [], phase: "init" },
    });
    const result = pathSum(root, []);
    steps.push({
      id: stepId++,
      description: `完成！共找到 ${result} 条路径`,
      data: { node: { ...root }, targetSum, result, finished: true },
      variables: { node: { ...root }, targetSum, result, finished: true },
    });
  }

  return steps;
}

