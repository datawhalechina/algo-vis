import { VisualizationStep } from "@/types";

/**
 * 生成二叉树的最近公共祖先算法步骤
 * 时间复杂度：O(n)
 * 空间复杂度：O(h)，h为树的高度
 */
export function generateLCASteps(
  tree: (number | null)[],
  p: number,
  q: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  
  // 查找节点在数组中的索引
  const pIndex = tree.indexOf(p);
  const qIndex = tree.indexOf(q);
  
  if (pIndex === -1 || qIndex === -1) {
    steps.push({
      id: steps.length,
      description: "无法找到指定的p或q节点",
      data: { tree },
      variables: { error: true },
    });
    return steps;
  }

  steps.push({
    id: steps.length,
    description: `开始查找节点 ${p} 和 ${q} 的最近公共祖先`,
    data: { tree },
    variables: { 
      targetP: p, 
      targetQ: q,
      currentIndex: 0,
    },
  });

  let lcaIndex: number | null = null;
  let lcaValue: number | null = null;

  function dfs(index: number): boolean {
    if (index >= tree.length || tree[index] === null) {
      return false;
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
        targetP: p,
        targetQ: q,
      },
    });

    // 检查当前节点是否是目标节点
    const isCurrent = val === p || val === q;
    
    // 递归搜索左右子树
    const foundInLeft = dfs(leftIndex);
    const foundInRight = dfs(rightIndex);

    // 如果当前节点是目标节点之一，或者左右子树都找到了目标节点
    if ((isCurrent && (foundInLeft || foundInRight)) || (foundInLeft && foundInRight)) {
      if (lcaIndex === null) {
        lcaIndex = index;
        lcaValue = val;
        steps.push({
          id: steps.length,
          description: `找到最近公共祖先：节点 ${val}`,
          data: { tree },
          variables: {
            currentNode: val,
            currentIndex: index,
            targetP: p,
            targetQ: q,
            lcaNode: val,
            lcaIndex: index,
            completed: true,
          },
        });
      }
    }

    return isCurrent || foundInLeft || foundInRight;
  }

  dfs(0);

  if (lcaValue !== null) {
    steps.push({
      id: steps.length,
      description: `完成！最近公共祖先是节点 ${lcaValue}`,
      data: { tree },
      variables: {
        targetP: p,
        targetQ: q,
        lcaNode: lcaValue,
        lcaIndex: lcaIndex,
        result: lcaValue,
        completed: true,
      },
    });
  }

  return steps;
}
