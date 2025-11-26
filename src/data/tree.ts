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
  // Problem 72: 翻转二叉树
  {
    id: 72,
    leetcodeNumber: 226,
    title: "翻转二叉树",
    difficulty: Difficulty.EASY,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给你一棵二叉树的根节点 root，翻转这棵二叉树，并返回其根节点。`,
    examples: [
      {
        input: "root = [4,2,7,1,3,6,9]",
        output: "[4,7,2,9,6,3,1]",
        explanation: "翻转二叉树，左右子树交换位置",
      },
      {
        input: "root = [2,1,3]",
        output: "[2,3,1]",
      },
      {
        input: "root = []",
        output: "[]",
      },
    ],
    constraints: [
      "树中节点数目范围在 [0, 100] 内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "可以使用递归或迭代方法",
      "递归法：翻转左右子树，然后交换左右子节点",
      "迭代法：使用队列或栈进行层序或前序遍历，交换每个节点的左右子节点",
    ],
    solution: {
      methodName: "递归法（DFS）",
      methodDescription:
        "使用递归深度优先搜索，对于每个节点，递归翻转其左右子树，然后交换左右子节点的引用。这是最简洁优雅的解法。",
      code: `function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  
  // 递归翻转左右子树
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  
  // 交换左右子节点
  root.left = right;
  root.right = left;
  
  return root;
}`,
      language: "typescript",
      keyLines: [2, 5, 6, 9, 10],
      steps: [
        "如果节点为空，直接返回 null",
        "递归翻转左子树",
        "递归翻转右子树",
        "交换当前节点的左右子节点",
        "返回当前节点",
      ],
      advantages: [
        "代码极简：只需几行代码",
        "思路清晰：直接体现递归定义",
        "易于理解：符合自然的树形思维",
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
          description: "使用递归深度优先搜索翻转",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["代码最简洁", "最优雅", "易于理解"],
          cons: ["递归栈可能较深"],
        },
        {
          name: "迭代法（BFS）",
          description: "使用队列进行层序遍历，交换每个节点的左右子节点",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["避免递归", "层序遍历更直观"],
          cons: ["需要额外队列空间", "代码稍复杂"],
        },
        {
          name: "迭代法（DFS-栈）",
          description: "使用栈进行前序遍历",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["避免递归"],
          cons: ["需要额外栈空间", "代码更复杂"],
        },
      ],
    },
  },
  // Problem 74: 对称二叉树
  {
    id: 74,
    leetcodeNumber: 101,
    title: "对称二叉树",
    difficulty: Difficulty.EASY,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给你一个二叉树的根节点 root ， 检查它是否轴对称。`,
    examples: [
      {
        input: "root = [1,2,2,3,4,4,3]",
        output: "true",
        explanation: "该二叉树是对称的",
      },
      {
        input: "root = [1,2,2,null,3,null,3]",
        output: "false",
        explanation: "该二叉树不对称",
      },
    ],
    constraints: [
      "树中节点数目在范围 [1, 1000] 内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "如果一个树的左子树与右子树镜像对称，那么这个树是对称的",
      "两个树互为镜像的条件：它们的根节点值相同；每个树的右子树与另一个树的左子树镜像对称",
      "可以用递归或迭代实现",
    ],
    solution: {
      methodName: "递归法",
      methodDescription:
        "递归检查两个子树是否镜像对称。两个树互为镜像的条件是：根节点值相同，且一棵树的左子树与另一棵树的右子树镜像对称。",
      code: `function isSymmetric(root: TreeNode | null): boolean {
  if (!root) return true;
  
  function isMirror(left: TreeNode | null, right: TreeNode | null): boolean {
    if (!left && !right) return true;
    if (!left || !right) return false;
    
    return left.val === right.val
      && isMirror(left.left, right.right)
      && isMirror(left.right, right.left);
  }
  
  return isMirror(root.left, root.right);
}`,
      language: "typescript",
      keyLines: [4, 5, 7, 8, 9],
      steps: [
        "如果根节点为空，返回 true",
        "定义辅助函数 isMirror 检查两棵树是否镜像",
        "如果两个节点都为空，返回 true",
        "如果只有一个为空，返回 false",
        "检查节点值是否相同，以及左右子树是否镜像对称",
      ],
      advantages: [
        "思路清晰：直接体现镜像定义",
        "代码简洁：递归实现优雅",
        "易于理解：符合直觉",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要遍历所有节点",
      },
      spaceComplexity: {
        value: "O(h)",
        description: "递归栈深度等于树的高度",
      },
      comparisons: [
        {
          name: "递归法",
          description: "递归检查镜像对称",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["代码简洁", "易于理解"],
          cons: ["递归栈空间"],
        },
        {
          name: "迭代法（队列）",
          description: "使用队列模拟递归",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["避免递归"],
          cons: ["代码稍复杂"],
        },
      ],
    },
  },
  // Problem 75: 二叉树的直径
  {
    id: 75,
    leetcodeNumber: 543,
    title: "二叉树的直径",
    difficulty: Difficulty.EASY,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给你一棵二叉树的根节点，返回该树的 直径 。

二叉树的 直径 是指树中任意两个节点之间最长路径的 长度 。这条路径可能经过也可能不经过根节点 root 。

两节点之间路径的 长度 由它们之间边数表示。`,
    examples: [
      {
        input: "root = [1,2,3,4,5]",
        output: "3",
        explanation: "3 ，取路径 [4,2,1,3] 或 [5,2,1,3] 的长度",
      },
      {
        input: "root = [1,2]",
        output: "1",
      },
    ],
    constraints: [
      "树中节点数目在范围 [1, 10⁴] 内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "树的直径 = 某个节点的左子树深度 + 右子树深度",
      "需要在递归计算深度的过程中，维护最大直径",
      "每个节点都可能是直径路径的最高点",
    ],
    solution: {
      methodName: "递归DFS",
      methodDescription:
        "在计算树的深度的同时，维护全局最大直径。对于每个节点，其通过该节点的最长路径 = 左子树深度 + 右子树深度。",
      code: `function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;
  
  function depth(node: TreeNode | null): number {
    if (!node) return 0;
    
    const leftDepth = depth(node.left);
    const rightDepth = depth(node.right);
    
    // 更新最大直径
    maxDiameter = Math.max(maxDiameter, leftDepth + rightDepth);
    
    // 返回当前节点的深度
    return Math.max(leftDepth, rightDepth) + 1;
  }
  
  depth(root);
  return maxDiameter;
}`,
      language: "typescript",
      keyLines: [2, 7, 8, 11, 14],
      steps: [
        "定义全局变量 maxDiameter 记录最大直径",
        "递归函数 depth 计算节点深度",
        "对于每个节点，计算左右子树深度",
        "更新最大直径 = 左深度 + 右深度",
        "返回当前节点深度 = max(左深度, 右深度) + 1",
      ],
      advantages: [
        "一次遍历：同时计算深度和直径",
        "空间优化：只需递归栈空间",
        "思路清晰：直径就是某节点的左右深度之和",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要访问每个节点一次",
      },
      spaceComplexity: {
        value: "O(h)",
        description: "递归栈深度等于树的高度",
      },
      comparisons: [
        {
          name: "递归DFS",
          description: "在计算深度时维护最大直径",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["一次遍历", "代码简洁", "最优解"],
          cons: ["需要理解递归思想"],
        },
      ],
    },
  },
  // Problem 76: 二叉树的层序遍历
  {
    id: 76,
    leetcodeNumber: 102,
    title: "二叉树的层序遍历",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.BFS],
    description: `给你二叉树的根节点 root ，返回其节点值的 层序遍历 （即逐层地，从左到右访问所有节点）。`,
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
      {
        input: "root = [1]",
        output: "[[1]]",
      },
      {
        input: "root = []",
        output: "[]",
      },
    ],
    constraints: [
      "树中节点数目在范围 [0, 2000] 内",
      "-1000 <= Node.val <= 1000",
    ],
    hints: [
      "使用队列（BFS）实现层序遍历",
      "每次处理一整层的节点",
      "记录每层的节点数量",
    ],
    solution: {
      methodName: "BFS（队列）",
      methodDescription:
        "使用队列进行广度优先搜索（BFS）。每次处理一整层的节点，将当前层的节点值存入结果数组，同时将下一层的节点加入队列。",
      code: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [5, 8, 9, 11, 15, 16],
      steps: [
        "初始化结果数组和队列，将根节点入队",
        "当队列不为空时循环",
        "记录当前层的节点数量 levelSize",
        "遍历当前层的所有节点：",
        "  • 取出节点，记录节点值",
        "  • 将左右子节点加入队列",
        "将当前层结果加入总结果",
      ],
      advantages: [
        "标准BFS：层序遍历的经典解法",
        "思路直观：逐层处理",
        "易于扩展：可以轻松获取每层信息",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要访问每个节点一次",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "队列最多存储一层的节点",
      },
      comparisons: [
        {
          name: "BFS（队列）",
          description: "使用队列进行层序遍历",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["标准解法", "思路直观", "易于理解"],
          cons: ["需要额外队列空间"],
        },
        {
          name: "DFS（递归）",
          description: "使用DFS并记录层级",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: false,
          pros: ["空间可能更小"],
          cons: ["不够直观", "需要额外参数记录层级"],
        },
      ],
    },
  },
  // Problem 77: 将有序数组转换为二叉搜索树
  {
    id: 77,
    leetcodeNumber: 108,
    title: "将有序数组转换为二叉搜索树",
    difficulty: Difficulty.EASY,
    category: [Category.TREE],
    methods: [SolutionMethod.DIVIDE_CONQUER, SolutionMethod.RECURSION],
    description: `给你一个整数数组 nums ，其中元素已经按 升序 排列，请你将其转换为一棵 高度平衡 二叉搜索树。

高度平衡 二叉树是一棵满足「每个节点的左右两个子树的高度差的绝对值不超过 1 」的二叉树。`,
    examples: [
      {
        input: "nums = [-10,-3,0,5,9]",
        output: "[0,-3,9,-10,null,5]",
        explanation: "[0,-10,5,null,-3,null,9] 也是正确答案",
      },
      {
        input: "nums = [1,3]",
        output: "[3,1] 或 [1,null,3]",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁴",
      "-10⁴ <= nums[i] <= 10⁴",
      "nums 按 严格递增 顺序排列",
    ],
    hints: [
      "选择中间元素作为根节点",
      "左半部分构建左子树，右半部分构建右子树",
      "递归构建，保证平衡",
    ],
    solution: {
      methodName: "分治递归",
      methodDescription:
        "选择有序数组的中间元素作为根节点，左半部分递归构建左子树，右半部分递归构建右子树。这样构建的树自然是平衡的。",
      code: `function sortedArrayToBST(nums: number[]): TreeNode | null {
  if (nums.length === 0) return null;
  
  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;
    
    const mid = Math.floor((left + right) / 2);
    const root = new TreeNode(nums[mid]);
    
    root.left = build(left, mid - 1);
    root.right = build(mid + 1, right);
    
    return root;
  }
  
  return build(0, nums.length - 1);
}`,
      language: "typescript",
      keyLines: [5, 7, 8, 10, 11],
      steps: [
        "定义递归函数 build(left, right)",
        "如果 left > right，返回 null",
        "计算中间位置 mid",
        "创建根节点 root = nums[mid]",
        "递归构建左子树 build(left, mid-1)",
        "递归构建右子树 build(mid+1, right)",
        "返回根节点",
      ],
      advantages: [
        "自动平衡：中间元素作为根保证平衡",
        "思路简洁：典型的分治算法",
        "时间最优：O(n) 一次遍历",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要访问数组中的每个元素一次",
      },
      spaceComplexity: {
        value: "O(log n)",
        description: "递归栈深度为树的高度",
      },
      comparisons: [
        {
          name: "分治递归",
          description: "选择中间元素为根，递归构建",
          timeComplexity: "O(n)",
          spaceComplexity: "O(log n)",
          isRecommended: true,
          pros: ["自动平衡", "代码简洁", "最优解"],
          cons: ["需要理解递归"],
        },
      ],
    },
  },
  // Problem 78: 验证二叉搜索树
  {
    id: 78,
    leetcodeNumber: 98,
    title: "验证二叉搜索树",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给你一个二叉树的根节点 root ，判断其是否是一个有效的二叉搜索树。

有效 二叉搜索树定义如下：

• 节点的左子树只包含 小于 当前节点的数。
• 节点的右子树只包含 大于 当前节点的数。
• 所有左子树和右子树自身必须也是二叉搜索树。`,
    examples: [
      {
        input: "root = [2,1,3]",
        output: "true",
      },
      {
        input: "root = [5,1,4,null,null,3,6]",
        output: "false",
        explanation: "根节点的值是 5 ，但是右子节点的值是 4",
      },
    ],
    constraints: [
      "树中节点数目范围在 [1, 10⁴] 内",
      "-2³¹ <= Node.val <= 2³¹ - 1",
    ],
    hints: [
      "不能只比较左右子节点，要保证所有左子树节点都小于根节点",
      "使用上下界限制节点值的范围",
      "中序遍历BST得到的是升序序列",
    ],
    solution: {
      methodName: "递归（范围限制）",
      methodDescription:
        "递归验证每个节点的值是否在合法范围内。对于左子树，更新上界为当前节点值；对于右子树，更新下界为当前节点值。",
      code: `function isValidBST(root: TreeNode | null): boolean {
  function validate(
    node: TreeNode | null,
    min: number | null,
    max: number | null
  ): boolean {
    if (!node) return true;
    
    // 检查当前节点值是否在范围内
    if ((min !== null && node.val <= min) || 
        (max !== null && node.val >= max)) {
      return false;
    }
    
    // 左子树：上界更新为当前值
    // 右子树：下界更新为当前值
    return validate(node.left, min, node.val) &&
           validate(node.right, node.val, max);
  }
  
  return validate(root, null, null);
}`,
      language: "typescript",
      keyLines: [9, 10, 11, 16, 17],
      steps: [
        "定义验证函数 validate(node, min, max)",
        "如果节点为空，返回 true",
        "检查节点值是否在 (min, max) 范围内",
        "递归验证左子树，上界更新为当前值",
        "递归验证右子树，下界更新为当前值",
      ],
      advantages: [
        "范围限制：避免只比较相邻节点的陷阱",
        "一次遍历：O(n) 时间",
        "空间优化：只需递归栈",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要访问每个节点一次",
      },
      spaceComplexity: {
        value: "O(h)",
        description: "递归栈深度等于树的高度",
      },
      comparisons: [
        {
          name: "递归（范围限制）",
          description: "使用上下界限制节点值范围",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["思路正确", "代码简洁", "最优解"],
          cons: ["需要理解范围传递"],
        },
        {
          name: "中序遍历",
          description: "中序遍历应该得到升序序列",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["思路直观"],
          cons: ["需要额外数组空间"],
        },
      ],
    },
  },
  // Problem 79: 二叉搜索树中第K小的元素
  {
    id: 79,
    leetcodeNumber: 230,
    title: "二叉搜索树中第K小的元素",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给定一个二叉搜索树的根节点 root ，和一个整数 k ，请你设计一个算法查找其中第 k 个最小元素（从 1 开始计数）。`,
    examples: [
      {
        input: "root = [3,1,4,null,2], k = 1",
        output: "1",
      },
      {
        input: "root = [5,3,6,2,4,null,null,1], k = 3",
        output: "3",
      },
    ],
    constraints: [
      "树中节点数为 n",
      "1 <= k <= n <= 10⁴",
      "0 <= Node.val <= 10⁴",
    ],
    hints: [
      "BST的中序遍历是升序的",
      "中序遍历第k个节点就是第k小的元素",
      "可以提前终止遍历",
    ],
    solution: {
      methodName: "中序遍历",
      methodDescription: "BST的中序遍历结果是升序的，因此第k个访问的节点就是第k小的元素。",
      code: `function kthSmallest(root: TreeNode | null, k: number): number {
  let count = 0;
  let result = 0;
  
  function inorder(node: TreeNode | null): void {
    if (!node || count >= k) return;
    
    inorder(node.left);
    
    count++;
    if (count === k) {
      result = node.val;
      return;
    }
    
    inorder(node.right);
  }
  
  inorder(root);
  return result;
}`,
      language: "typescript",
      keyLines: [8, 10, 11, 12],
      steps: [
        "中序遍历BST（左-根-右）",
        "计数访问的节点数",
        "当计数等于k时，记录结果并返回",
      ],
      advantages: [
        "利用BST性质",
        "中序遍历即升序",
        "可以提前终止",
      ],
      timeComplexity: { value: "O(k)", description: "最多访问k个节点" },
      spaceComplexity: { value: "O(h)", description: "递归栈深度" },
      comparisons: [
        {
          name: "中序遍历",
          description: "利用BST中序遍历的升序性质",
          timeComplexity: "O(k)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["思路直观", "可提前终止"],
          cons: ["递归栈空间"],
        },
      ],
    },
  },
  // Problem 80: 二叉树的右视图
  {
    id: 80,
    leetcodeNumber: 199,
    title: "二叉树的右视图",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.BFS, SolutionMethod.DFS],
    description: `给定一个二叉树的 根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。`,
    examples: [
      {
        input: "root = [1,2,3,null,5,null,4]",
        output: "[1,3,4]",
      },
      {
        input: "root = [1,null,3]",
        output: "[1,3]",
      },
      {
        input: "root = []",
        output: "[]",
      },
    ],
    constraints: [
      "树中节点数目在范围 [0, 100] 内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "使用层序遍历，每层只取最右侧的节点",
      "也可以用DFS，优先访问右子树",
    ],
    solution: {
      methodName: "层序遍历（BFS）",
      methodDescription: "使用层序遍历，每层只保留最右侧的节点值。",
      code: `function rightSideView(root: TreeNode | null): number[] {
  if (!root) return [];
  
  const result: number[] = [];
  const queue: TreeNode[] = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      
      // 每层最后一个节点就是右视图
      if (i === levelSize - 1) {
        result.push(node.val);
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [8, 14, 15],
      steps: [
        "层序遍历二叉树",
        "记录每层节点数量",
        "每层最后一个节点加入结果",
      ],
      advantages: [
        "思路直观",
        "层序遍历标准做法",
        "易于理解",
      ],
      timeComplexity: { value: "O(n)", description: "遍历所有节点" },
      spaceComplexity: { value: "O(n)", description: "队列空间" },
      comparisons: [
        {
          name: "BFS（层序遍历）",
          description: "每层取最右节点",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["思路直观", "标准做法"],
          cons: ["队列空间"],
        },
      ],
    },
  },
  // Problem 81: 二叉树展开为链表
  {
    id: 81,
    leetcodeNumber: 114,
    title: "二叉树展开为链表",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给你二叉树的根结点 root ，请你将它展开为一个单链表：

• 展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。
• 展开后的单链表应该与二叉树 先序遍历 顺序相同。`,
    examples: [
      {
        input: "root = [1,2,5,3,4,null,6]",
        output: "[1,null,2,null,3,null,4,null,5,null,6]",
        explanation: "展开后按前序遍历顺序排列",
      },
      {
        input: "root = []",
        output: "[]",
      },
      {
        input: "root = [0]",
        output: "[0]",
      },
    ],
    constraints: [
      "树中节点数在范围 [0, 2000] 内",
      "-100 <= Node.val <= 100",
    ],
    hints: [
      "按照前序遍历的顺序展开",
      "可以先遍历收集节点，再重新连接",
      "原地算法：将左子树插入到右子树位置",
    ],
    solution: {
      methodName: "后序遍历",
      methodDescription: "后序遍历处理每个节点，将左子树移到右侧，原右子树接到左子树最右节点后。",
      code: `function flatten(root: TreeNode | null): void {
  if (!root) return;
  
  // 后序遍历：先处理左右子树
  flatten(root.left);
  flatten(root.right);
  
  // 保存原右子树
  const rightSubtree = root.right;
  
  // 将左子树移到右侧
  root.right = root.left;
  root.left = null;
  
  // 找到当前右子树的最右节点
  let current = root;
  while (current.right) {
    current = current.right;
  }
  
  // 将原右子树接到最右节点
  current.right = rightSubtree;
}`,
      language: "typescript",
      keyLines: [5, 6, 12, 13, 22],
      steps: [
        "后序遍历处理左右子树",
        "保存原右子树",
        "将左子树移到右侧",
        "找到新右子树的最右节点",
        "接上原右子树",
      ],
      advantages: [
        "原地算法",
        "O(1)额外空间",
        "前序遍历顺序",
      ],
      timeComplexity: { value: "O(n)", description: "遍历所有节点" },
      spaceComplexity: { value: "O(h)", description: "递归栈深度" },
      comparisons: [
        {
          name: "后序遍历",
          description: "原地展开",
          timeComplexity: "O(n)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["原地算法", "空间优化"],
          cons: ["需要理解递归顺序"],
        },
      ],
    },
  },
  // Problem 82: 从前序与中序遍历序列构造二叉树
  {
    id: 82,
    leetcodeNumber: 105,
    title: "从前序与中序遍历序列构造二叉树",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.DIVIDE_CONQUER, SolutionMethod.RECURSION],
    description: `给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的先序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点。`,
    examples: [
      {
        input: "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]",
        output: "[3,9,20,null,null,15,7]",
      },
      {
        input: "preorder = [-1], inorder = [-1]",
        output: "[-1]",
      },
    ],
    constraints: [
      "1 <= preorder.length <= 3000",
      "inorder.length == preorder.length",
      "-3000 <= preorder[i], inorder[i] <= 3000",
      "preorder 和 inorder 均无重复元素",
      "inorder 均出现在 preorder",
      "preorder 保证为二叉树的前序遍历序列",
      "inorder 保证为二叉树的中序遍历序列",
    ],
    hints: [
      "前序遍历的第一个元素是根节点",
      "在中序遍历中找到根节点位置，左边是左子树，右边是右子树",
      "递归构建左右子树",
    ],
    solution: {
      methodName: "分治递归",
      methodDescription: "前序遍历第一个元素是根节点，在中序遍历中找到根节点，划分左右子树，递归构建。",
      code: `function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  if (preorder.length === 0) return null;
  
  const rootVal = preorder[0];
  const root = new TreeNode(rootVal);
  
  const rootIndex = inorder.indexOf(rootVal);
  const leftSize = rootIndex;
  
  root.left = buildTree(
    preorder.slice(1, 1 + leftSize),
    inorder.slice(0, rootIndex)
  );
  
  root.right = buildTree(
    preorder.slice(1 + leftSize),
    inorder.slice(rootIndex + 1)
  );
  
  return root;
}`,
      language: "typescript",
      keyLines: [4, 7, 10, 15],
      steps: [
        "从前序遍历取根节点",
        "在中序遍历中找到根节点位置",
        "递归构建左子树",
        "递归构建右子树",
      ],
      advantages: [
        "分治思想",
        "递归清晰",
        "正确性有保证",
      ],
      timeComplexity: { value: "O(n²)", description: "每次查找根节点位置O(n)" },
      spaceComplexity: { value: "O(n)", description: "递归栈和切片空间" },
      comparisons: [
        {
          name: "分治递归",
          description: "利用前序和中序特性",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["思路清晰", "易于理解"],
          cons: ["时间复杂度较高"],
        },
      ],
    },
  },
  // Problem 83: 路径总和 III
  {
    id: 83,
    leetcodeNumber: 437,
    title: "路径总和 III",
    difficulty: Difficulty.MEDIUM,
    category: [Category.TREE],
    methods: [SolutionMethod.DFS, SolutionMethod.RECURSION],
    description: `给定一个二叉树的根节点 root ，和一个整数 targetSum ，求该二叉树里节点值之和等于 targetSum 的 路径 的数目。

路径 不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。`,
    examples: [
      {
        input: "root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8",
        output: "3",
        explanation: "和等于 8 的路径有 3 条",
      },
      {
        input: "root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22",
        output: "3",
      },
    ],
    constraints: [
      "树中节点总数在范围 [0, 1000] 内",
      "-10⁹ <= Node.val <= 10⁹",
      "-1000 <= targetSum <= 1000",
    ],
    hints: [
      "路径可以从任意节点开始",
      "对每个节点，计算从该节点出发的所有路径",
      "使用前缀和优化",
    ],
    solution: {
      methodName: "DFS + 路径搜索",
      methodDescription: "对每个节点作为起点，向下DFS搜索所有可能的路径，统计路径和等于目标值的数量。",
      code: `function pathSum(root: TreeNode | null, targetSum: number): number {
  if (!root) return 0;
  
  // 从当前节点出发的路径数
  function findPaths(node: TreeNode | null, sum: number): number {
    if (!node) return 0;
    
    let count = 0;
    if (node.val === sum) count++;
    
    count += findPaths(node.left, sum - node.val);
    count += findPaths(node.right, sum - node.val);
    
    return count;
  }
  
  // 遍历每个节点作为起点
  return findPaths(root, targetSum) +
         pathSum(root.left, targetSum) +
         pathSum(root.right, targetSum);
}`,
      language: "typescript",
      keyLines: [5, 9, 11, 12, 18, 19, 20],
      steps: [
        "定义辅助函数从节点出发搜索路径",
        "检查当前节点是否满足条件",
        "递归搜索左右子树",
        "遍历每个节点作为起点",
      ],
      advantages: [
        "思路直观",
        "DFS搜索所有路径",
        "双重递归",
      ],
      timeComplexity: { value: "O(n²)", description: "每个节点都要搜索一次" },
      spaceComplexity: { value: "O(h)", description: "递归栈深度" },
      comparisons: [
        {
          name: "DFS + 路径搜索",
          description: "对每个节点搜索路径",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(h)",
          isRecommended: true,
          pros: ["思路直观", "易于实现"],
          cons: ["时间复杂度较高"],
        },
      ],
    },
  },
];
