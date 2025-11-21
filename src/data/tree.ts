import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 树类题目数据
 */
export const treeProblems: Problem[] = [
  {
    id: 21,
    leetcodeNumber: 104,
    title: "二叉树的最大深度",
    difficulty: Difficulty.EASY,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给定一个二叉树，找出其最大深度。

二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。

说明: 叶子节点是指没有子节点的节点。`,
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
        explanation: "给定二叉树 [3,9,20,null,null,15,7]，返回它的最大深度 3",
      },
      {
        input: "root = [1,null,2]",
        output: "2",
      },
    ],
    constraints: [
      "树中节点的数量在 [0, 10⁴] 范围内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "可以使用递归或迭代两种方法",
      "递归法：当前节点的深度 = max(左子树深度, 右子树深度) + 1",
      "迭代法：使用层序遍历（BFS），记录层数",
    ],
    solution: {
      methodName: "递归法（DFS）",
      methodDescription:
        "使用递归深度优先搜索，每个节点的深度等于其左右子树的最大深度加1。这是最直观、代码最简洁的解法。",
      code: `function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  
  return Math.max(leftDepth, rightDepth) + 1;
}`,
      language: "typescript",
      keyLines: [2, 4, 6],
      steps: [
        "如果节点为空，返回深度 0",
        "递归计算左子树的最大深度",
        "递归计算右子树的最大深度",
        "返回 max(左子树深度, 右子树深度) + 1",
      ],
      advantages: [
        "代码简洁：只需几行代码即可实现",
        "思路清晰：直接体现了问题的递归性质",
        "易于理解：符合直觉的递归思维",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要访问树中的每个节点一次",
      },
      spaceComplexity: {
        value: "O(h)",
        description: "递归调用栈的深度等于树的高度，最坏情况下为 O(n)",
      },
      comparisons: [
        {
          name: "递归法（DFS）",
          description: "使用递归深度优先搜索",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["代码简洁", "思路清晰"],
          cons: ["递归调用栈可能较深"],
        },
        {
          name: "迭代法（BFS）",
          description: "使用层序遍历，记录层数",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["避免递归栈溢出"],
          cons: ["需要额外的队列空间", "代码相对复杂"],
        },
      ],
    },
  },
  // Problem 68: 二叉树的中序遍历
  {
    id: 68,
    leetcodeNumber: 94,
    title: "二叉树的中序遍历",
    difficulty: Difficulty.EASY,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION, SolutionMethod.ITERATION],
    description: `给定一个二叉树的根节点 root ，返回它的中序遍历结果。`,
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
      },
      {
        input: "root = []",
        output: "[]",
      },
      {
        input: "root = [1]",
        output: "[1]",
      },
    ],
    constraints: [
      "树中节点数目在范围 [0, 100] 内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "递归法最简单",
      "迭代法使用栈模拟递归",
      "中序遍历：左 -> 根 -> 右",
    ],
    solution: {
      methodName: "递归法",
      methodDescription: "使用递归实现中序遍历：先遍历左子树，再访问根节点，最后遍历右子树",
      code: `function inorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  
  function inorder(node: TreeNode | null): void {
    if (!node) return;
    
    inorder(node.left);
    result.push(node.val);
    inorder(node.right);
  }
  
  inorder(root);
  return result;
}`,
      language: "typescript",
      keyLines: [7, 8, 9],
      steps: ["递归遍历左子树", "访问根节点", "递归遍历右子树"],
      advantages: ["代码简洁", "逻辑清晰", "易于理解"],
      timeComplexity: { value: "O(n)", description: "每个节点访问一次" },
      spaceComplexity: { value: "O(n)", description: "递归栈空间" },
      comparisons: [
        {
          name: "递归法",
          description: "使用递归实现",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["代码简洁", "易于理解"],
          cons: ["递归栈空间"],
        },
        {
          name: "迭代法（栈）",
          description: "使用显式栈模拟递归",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["避免递归", "更灵活"],
          cons: ["代码稍复杂"],
        },
        {
          name: "Morris遍历",
          description: "利用线索二叉树，O(1)空间",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["O(1)空间"],
          cons: ["代码复杂", "修改树结构"],
        },
      ],
    },
  },
];
