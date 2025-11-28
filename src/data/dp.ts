import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 动态规划类题目数据
 */
export const dpProblems: Problem[] = [
  // Problem 101: 打家劫舍
  {
    id: 101,
    leetcodeNumber: 198,
    title: "打家劫舍",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你不触动警报装置的情况下，一夜之内能够偷窃到的最高金额。`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。偷窃到的最高金额 = 1 + 3 = 4 。" },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。偷窃到的最高金额 = 2 + 9 + 1 = 12 。" },
    ],
    constraints: [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400",
    ],
    hints: ["动态规划", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])"],
    solution: {
      methodName: "动态规划",
      methodDescription: "对于每个房屋，有偷和不偷两种选择。如果偷当前房屋，就不能偷前一间；如果不偷，最大金额就是前一间的最大金额。",
      code: `function rob(nums: number[]): number {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  
  const dp = new Array(n);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  
  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }
  
  return dp[n - 1];
}`,
      language: "typescript",
      keyLines: [11],
      steps: [
        "处理边界情况（n=0, n=1）",
        "初始化dp[0]和dp[1]",
        "从第2间房屋开始遍历",
        "对于每间房屋，计算偷或不偷的最大值",
        "返回dp[n-1]",
      ],
      advantages: [
        "时间复杂度O(n)",
        "空间复杂度O(n)，可优化到O(1)",
        "思路清晰",
      ],
      timeComplexity: { value: "O(n)", description: "遍历一次数组" },
      spaceComplexity: { value: "O(n)", description: "dp数组" },
      comparisons: [],
    },
  },
  // Problem 103: 完全平方数
  {
    id: 103,
    leetcodeNumber: 279,
    title: "完全平方数",
    difficulty: Difficulty.MEDIUM,
    category: [Category.MATH],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个整数 n ，返回和为 n 的完全平方数的最少数量。

完全平方数 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。`,
    examples: [
      { input: "n = 12", output: "3", explanation: "12 = 4 + 4 + 4" },
      { input: "n = 13", output: "2", explanation: "13 = 4 + 9" },
    ],
    constraints: [
      "1 <= n <= 10⁴",
    ],
    hints: ["动态规划", "完全背包问题"],
    solution: {
      methodName: "动态规划",
      methodDescription: "dp[i]表示和为i的完全平方数的最少数量。对于每个i，尝试所有小于等于i的完全平方数j²，dp[i] = min(dp[i - j²] + 1)。",
      code: `function numSquares(n: number): number {
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j * j <= i; j++) {
      dp[i] = Math.min(dp[i], dp[i - j * j] + 1);
    }
  }
  
  return dp[n];
}`,
      language: "typescript",
      keyLines: [7],
      steps: [
        "初始化dp数组，dp[0] = 0",
        "遍历1到n的每个数i",
        "对于每个i，遍历所有完全平方数j²",
        "更新dp[i] = min(dp[i], dp[i - j²] + 1)",
        "返回dp[n]",
      ],
      advantages: [
        "时间复杂度O(n√n)",
        "空间复杂度O(n)",
        "经典的完全背包问题",
      ],
      timeComplexity: { value: "O(n√n)", description: "外层循环n次，内层循环√n次" },
      spaceComplexity: { value: "O(n)", description: "dp数组" },
      comparisons: [],
    },
  },
  // Problem 105: 最长递增子序列
  {
    id: 105,
    leetcodeNumber: 300,
    title: "最长递增子序列",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个整数数组 nums，找到其中最长严格递增子序列的长度。

子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，[3,6,2,7] 是数组 [0,3,1,6,2,2,7] 的子序列。`,
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "最长递增子序列是 [2,3,7,101]，因此长度为 4" },
      { input: "nums = [0,1,0,3,2,3]", output: "4" },
      { input: "nums = [7,7,7,7,7,7,7]", output: "1" },
    ],
    constraints: [
      "1 <= nums.length <= 2500",
      "-10⁴ <= nums[i] <= 10⁴",
    ],
    hints: [
      "dp[i] 表示以 nums[i] 结尾的最长递增子序列长度",
      "对于每个 i，遍历所有 j < i，如果 nums[j] < nums[i]，则 dp[i] = max(dp[i], dp[j] + 1)",
      "优化：可以使用二分查找优化到 O(n log n)",
    ],
    solution: {
      methodName: "动态规划",
      methodDescription: "dp[i] 表示以 nums[i] 结尾的最长递增子序列长度。对于每个位置 i，检查所有 j < i，如果 nums[j] < nums[i]，则可以将 nums[i] 接在以 nums[j] 结尾的子序列后面。",
      code: `function lengthOfLIS(nums: number[]): number {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  let maxLen = 1;
  
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }
  
  return maxLen;
}`,
      language: "typescript",
      keyLines: [3, 8, 9, 12],
      steps: [
        "初始化 dp 数组，每个元素初始值为 1（单个元素）",
        "遍历每个位置 i",
        "  • 对于每个 j < i",
        "  • 如果 nums[j] < nums[i]，更新 dp[i] = max(dp[i], dp[j] + 1)",
        "  • 更新全局最大值",
        "返回最大值",
      ],
      advantages: [
        "经典 DP 问题",
        "思路清晰",
        "易于理解",
      ],
      timeComplexity: { value: "O(n²)", description: "双重循环" },
      spaceComplexity: { value: "O(n)", description: "dp 数组" },
      comparisons: [],
    },
  },
  // Problem 106: 零钱兑换
  {
    id: 106,
    leetcodeNumber: 322,
    title: "零钱兑换",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个整数数组 coins 表示不同面额的硬币，以及一个整数 amount 表示总金额。

计算并返回可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。

你可以认为每种硬币的数量是无限的。`,
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2³¹ - 1",
      "0 <= amount <= 10⁴",
    ],
    hints: [
      "完全背包问题",
      "dp[i] 表示凑成金额 i 所需的最少硬币数",
      "dp[i] = min(dp[i - coin] + 1) 对所有 coin <= i",
    ],
    solution: {
      methodName: "动态规划（完全背包）",
      methodDescription: "dp[i] 表示凑成金额 i 所需的最少硬币数。对于每个金额 i，尝试使用每种硬币，取最小值。",
      code: `function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i >= coin) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      language: "typescript",
      keyLines: [2, 3, 8],
      steps: [
        "初始化 dp 数组，dp[0] = 0，其余为 Infinity",
        "遍历每个金额 i (1 到 amount)",
        "  • 对于每种硬币 coin",
        "  • 如果 i >= coin，更新 dp[i] = min(dp[i], dp[i - coin] + 1)",
        "返回 dp[amount]，如果为 Infinity 返回 -1",
      ],
      advantages: [
        "经典完全背包",
        "思路清晰",
        "时间空间最优",
      ],
      timeComplexity: { value: "O(amount × coins.length)", description: "双重循环" },
      spaceComplexity: { value: "O(amount)", description: "dp 数组" },
      comparisons: [],
    },
  },
  // Problem 107: 不同路径
  {
    id: 107,
    leetcodeNumber: 62,
    title: "不同路径",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY, Category.MATRIX],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `一个机器人位于一个 m x n 网格的左上角（起始点在下图中标记为 "Start" ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 "Finish" ）。

问总共有多少条不同的路径？`,
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3", explanation: "从左上角开始，总共有 3 条路径可以到达右下角。1. 向右 -> 向下 -> 向下 2. 向下 -> 向下 -> 向右 3. 向下 -> 向右 -> 向下" },
      { input: "m = 7, n = 3", output: "28" },
      { input: "m = 3, n = 3", output: "6" },
    ],
    constraints: [
      "1 <= m, n <= 100",
    ],
    hints: [
      "dp[i][j] 表示到达 (i,j) 的路径数",
      "dp[i][j] = dp[i-1][j] + dp[i][j-1]",
      "边界：第一行和第一列都是 1",
    ],
    solution: {
      methodName: "动态规划（二维）",
      methodDescription: "dp[i][j] 表示到达位置 (i,j) 的不同路径数。由于只能向下或向右，所以 dp[i][j] = dp[i-1][j] + dp[i][j-1]。",
      code: `function uniquePaths(m: number, n: number): number {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  
  return dp[m - 1][n - 1];
}`,
      language: "typescript",
      keyLines: [2, 6],
      steps: [
        "初始化 dp 数组，第一行和第一列都是 1",
        "遍历每个位置 (i,j)",
        "  • dp[i][j] = dp[i-1][j] + dp[i][j-1]",
        "返回 dp[m-1][n-1]",
      ],
      advantages: [
        "二维 DP 经典题",
        "状态转移清晰",
        "可优化为一维 DP",
      ],
      timeComplexity: { value: "O(m × n)", description: "遍历整个网格" },
      spaceComplexity: { value: "O(m × n)", description: "dp 数组" },
      comparisons: [],
    },
  },
  // Problem 108: 乘积最大子数组
  {
    id: 108,
    leetcodeNumber: 152,
    title: "乘积最大子数组",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个整数数组 nums，请你找出数组中乘积最大的非空连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。

测试用例的答案是一个 32-位 整数。

子数组 是数组的连续子序列。`,
    examples: [
      { input: "nums = [2,3,-2,4]", output: "6", explanation: "子数组 [2,3] 有最大乘积 6" },
      { input: "nums = [-2,0,-1]", output: "0", explanation: "结果不能为 2，因为 [-2,-1] 不是子数组" },
    ],
    constraints: [
      "1 <= nums.length <= 2 * 10⁴",
      "-10 <= nums[i] <= 10",
      "nums 的任何前缀或后缀的乘积都保证是一个 32-位 整数",
    ],
    hints: [
      "需要同时维护最大值和最小值",
      "负数 × 最小值 = 最大值",
      "maxDP[i] = max(nums[i], maxDP[i-1] × nums[i], minDP[i-1] × nums[i])",
      "minDP[i] = min(nums[i], maxDP[i-1] × nums[i], minDP[i-1] × nums[i])",
    ],
    solution: {
      methodName: "动态规划（维护最大最小值）",
      methodDescription: "由于存在负数，负数会使最大值变最小值，最小值变最大值。因此需要同时维护当前最大值和最小值。",
      code: `function maxProduct(nums: number[]): number {
  let maxDP = nums[0];
  let minDP = nums[0];
  let result = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];
    const tempMax = maxDP;
    
    maxDP = Math.max(num, maxDP * num, minDP * num);
    minDP = Math.min(num, tempMax * num, minDP * num);
    
    result = Math.max(result, maxDP);
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [10, 11, 13],
      steps: [
        "初始化 maxDP 和 minDP 为 nums[0]",
        "遍历数组从索引 1 开始",
        "  • 保存当前 maxDP 到临时变量",
        "  • 更新 maxDP = max(当前值, maxDP × 当前值, minDP × 当前值)",
        "  • 更新 minDP = min(当前值, tempMax × 当前值, minDP × 当前值)",
        "  • 更新全局最大值",
        "返回结果",
      ],
      advantages: [
        "巧妙维护最大最小值",
        "空间优化到 O(1)",
        "处理负数情况",
      ],
      timeComplexity: { value: "O(n)", description: "遍历一次数组" },
      spaceComplexity: { value: "O(1)", description: "只用常数空间" },
      comparisons: [],
    },
  },
];
