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
];
