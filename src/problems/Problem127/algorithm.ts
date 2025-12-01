import { VisualizationStep } from "@/types";

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function generateInvertTreeSteps(root: TreeNode | null): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const invert = (node: TreeNode | null, path: number[]): TreeNode | null => {
    if (!node) {
      steps.push({
        id: stepId++,
        description: `节点为空，返回 null`,
        data: { node: null, path, action: "return_null" },
        variables: { node: null, path, action: "return_null", phase: "base_case" },
      });
      return null;
    }

    steps.push({
      id: stepId++,
      description: `访问节点 ${node.val}，准备翻转其左右子树`,
      data: { node: { ...node }, path, action: "visit" },
      variables: { node: { ...node }, path, action: "visit", phase: "visit" },
    });

    // 递归翻转左右子树
    const left = invert(node.left, [...path, 0]);
    const right = invert(node.right, [...path, 1]);

    steps.push({
      id: stepId++,
      description: `节点 ${node.val}：交换左右子树`,
      data: { node: { ...node }, path, action: "swap", left, right },
      variables: { node: { ...node }, path, action: "swap", left, right, phase: "swap" },
    });

    // 交换左右子节点
    node.left = right;
    node.right = left;

    steps.push({
      id: stepId++,
      description: `节点 ${node.val}：翻转完成`,
      data: { node: { ...node }, path, action: "complete" },
      variables: { node: { ...node }, path, action: "complete", phase: "complete" },
    });

    return node;
  };

  if (root) {
    steps.push({
      id: stepId++,
      description: `开始翻转二叉树，根节点值为 ${root.val}`,
      data: { node: { ...root }, path: [], action: "start" },
      variables: { node: { ...root }, path: [], action: "start", phase: "start" },
    });
    invert(root, []);
    steps.push({
      id: stepId++,
      description: `翻转完成！`,
      data: { node: { ...root }, path: [], action: "finished", finished: true },
      variables: { node: { ...root }, path: [], action: "finished", finished: true },
    });
  }

  return steps;
}

