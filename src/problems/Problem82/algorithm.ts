import { VisualizationStep } from "@/types";

/**
 * LeetCode 105: 从前序与中序遍历序列构造二叉树
 * 难度：中等
 * 
 * 给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的前序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点。
 */

interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
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

export function generateBuildTreeSteps(preorder: number[], inorder: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: "🏯 开始从前序与中序遍历构建二叉树",
    data: { tree: [] },
    variables: { preorder: [...preorder], inorder: [...inorder], builtNodes: [] }
  });

  if (preorder.length === 0) {
    steps.push({
      id: stepId++,
      description: "前序遍历为空，返回空树",
      data: { tree: [] },
      variables: { preorder: [], inorder: [] }
    });
    return steps;
  }

  let root: TreeNode | null = null;

  function buildTree(
    preStart: number,
    preEnd: number,
    inStart: number,
    inEnd: number
  ): TreeNode | null {
    if (preStart > preEnd) return null;

    const rootVal = preorder[preStart];
    
    steps.push({
      id: stepId++,
      description: `🎯 步骤1：从前序遍历取根节点 ${rootVal}（前序首元素就是根）`,
      data: { tree: root ? treeToArray(root) : [] },
      variables: { 
        currentRoot: rootVal,
        preorder: [...preorder],
        inorder: [...inorder],
        preRange: [preStart, preEnd],
        inRange: [inStart, inEnd],
        step: 'find-root'
      }
    });

    const node: TreeNode = { val: rootVal, left: null, right: null };

    // 在中序遍历中找到根节点的位置
    const rootIndex = inorder.indexOf(rootVal, inStart);
    const leftSize = rootIndex - inStart;
    
    steps.push({
      id: stepId++,
      description: `🔍 步骤2：在中序中找到 ${rootVal}（位置 ${rootIndex}）→ 左边 ${leftSize} 个节点是左子树，右边是右子树`,
      data: { tree: root ? treeToArray(root) : [rootVal] },
      variables: { 
        currentRoot: rootVal,
        rootIndex,
        leftSize,
        rightSize: inEnd - rootIndex,
        preorder: [...preorder],
        inorder: [...inorder],
        step: 'split'
      }
    });

    // 构建左子树
    if (leftSize > 0) {
      steps.push({
        id: stepId++,
        description: `🌳 递归构建节点 ${rootVal} 的左子树（${leftSize} 个节点）`,
        data: { tree: root ? treeToArray(root) : [rootVal] },
        variables: { 
          currentRoot: rootVal,
          buildingLeft: true,
          step: 'build-left'
        }
      });
      
      node.left = buildTree(preStart + 1, preStart + leftSize, inStart, rootIndex - 1);
    }

    // 构建右子树
    if (rootIndex < inEnd) {
      steps.push({
        id: stepId++,
        description: `🌳 递归构建节点 ${rootVal} 的右子树`,
        data: { tree: root ? treeToArray(root) : treeToArray(node) },
        variables: { 
          currentRoot: rootVal,
          buildingRight: true,
          step: 'build-right'
        }
      });
      
      node.right = buildTree(preStart + leftSize + 1, preEnd, rootIndex + 1, inEnd);
    }

    if (!root) root = node;

    steps.push({
      id: stepId++,
      description: `✅ 节点 ${rootVal} 构建完成（左右子树已连接）`,
      data: { tree: treeToArray(root) },
      variables: { 
        completedNode: rootVal,
        step: 'completed'
      }
    });

    return node;
  }

  root = buildTree(0, preorder.length - 1, 0, inorder.length - 1);

  steps.push({
    id: stepId++,
    description: `🎉 二叉树构建完成！根据前序 [${preorder.join(',')}] 和中序 [${inorder.join(',')}] 成功构建`,
    data: { tree: treeToArray(root) },
    variables: { finalResult: treeToArray(root), preorder: [...preorder], inorder: [...inorder] }
  });

  return steps;
}
