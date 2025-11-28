import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 贪心算法类题目数据
 */
export const greedyProblems: Problem[] = [
  // Problem 100: 跳跃游戏
  {
    id: 100,
    leetcodeNumber: 55,
    title: "跳跃游戏",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.GREEDY],
    description: `给定一个非负整数数组 nums ，你最初位于数组的第一个下标。

数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个下标。`,
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。" },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "无论怎样，总会到达下标为 3 的位置。但该下标的最大跳跃长度是 0 ， 所以永远不可能到达最后一个下标。" },
    ],
    constraints: [
      "1 <= nums.length <= 10⁴",
      "0 <= nums[i] <= 10⁵",
    ],
    hints: ["贪心", "维护最远可达位置"],
    solution: {
      methodName: "贪心算法",
      methodDescription: "维护一个最远可达位置maxReach，遍历数组时不断更新这个位置。如果当前位置i超过maxReach，说明无法继续前进。",
      code: `function canJump(nums: number[]): boolean {
  let maxReach = 0;
  
  for (let i = 0; i < nums.length; i++) {
    // 如果当前位置超过了最远可达位置，返回false
    if (i > maxReach) {
      return false;
    }
    
    // 更新最远可达位置
    maxReach = Math.max(maxReach, i + nums[i]);
    
    // 如果已经可以到达最后一个位置，返回true
    if (maxReach >= nums.length - 1) {
      return true;
    }
  }
  
  return maxReach >= nums.length - 1;
}`,
      language: "typescript",
      keyLines: [6, 10, 13],
      steps: [
        "初始化最远可达位置maxReach为0",
        "遍历数组的每个位置",
        "如果当前位置超过maxReach，说明无法到达，返回false",
        "更新maxReach为当前位置能跳到的最远位置",
        "如果maxReach已经达到或超过最后一个位置，返回true",
      ],
      advantages: [
        "时间复杂度O(n)，只需遍历一次数组",
        "空间复杂度O(1)，只需常数空间",
        "贪心策略简单高效",
        "提前终止可以优化性能",
      ],
      timeComplexity: { value: "O(n)", description: "n为数组长度，最多遍历一次数组" },
      spaceComplexity: { value: "O(1)", description: "只需要常数级别的额外空间" },
      comparisons: [
        {
          name: "动态规划",
          description: "使用dp[i]表示能否到达位置i",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["思路直观"],
          cons: ["时间复杂度高", "空间复杂度高"],
        },
      ],
    },
  },
];
