import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 数组类题目数据
 * 包含：两数之和、合并两个有序数组、盛最多水的容器、移动零、买卖股票的最佳时机、最大子数组和
 */
export const arrayProblems: Problem[] = [
  {
    id: 1,
    leetcodeNumber: 1,
    title: "两数之和",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY, Category.HASH_TABLE],
    methods: [SolutionMethod.TWO_POINTERS, SolutionMethod.ITERATION],
    description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "因为 nums[0] + nums[1] == 9，返回 [0, 1]",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "只会存在一个有效答案",
    ],
    hints: [
      "尝试使用哈希表来优化时间复杂度",
      "遍历数组时，检查 target - nums[i] 是否在哈希表中",
    ],
    solution: {
      methodName: "哈希表（经典解法）",
      methodDescription:
        "使用哈希表可以将查找时间从 O(n) 降低到 O(1)，从而把整体时间复杂度降低到 O(n)。",
      code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
      language: "typescript",
      keyLines: [7, 8, 11], // 关键代码行：检查哈希表、返回结果、存入哈希表
      steps: [
        "创建一个哈希表（Map）用于存储已遍历过的数字及其索引",
        "遍历数组，对于每个元素 nums[i]，计算其补数 complement = target - nums[i]",
        "检查补数是否在哈希表中：",
        "  • 如果存在，说明找到答案，返回 [哈希表中的索引, 当前索引 i]",
        "  • 如果不存在，将当前数字和索引存入哈希表",
        "继续遍历直到找到答案",
      ],
      advantages: [
        "查找快：哈希表的查找时间为 O(1)，远快于数组的 O(n)",
        "一次遍历：只需遍历数组一次，边遍历边查找",
        "空间可接受：虽然需要 O(n) 额外空间，但在现代计算机中完全可接受",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "只需遍历数组一次，每次哈希表的查询和插入操作都是 O(1)",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "哈希表最多需要存储 n 个元素",
      },
      comparisons: [
        {
          name: "暴力解法（两层循环）",
          description: "对每个元素，遍历后续所有元素寻找配对",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["不需要额外空间", "实现简单"],
          cons: ["效率低", "数据量大时耗时严重"],
        },
        {
          name: "哈希表解法",
          description: "用空间换时间，一次遍历即可完成",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["高效", "在面试和实际应用中最常用"],
          cons: ["需要额外空间"],
        },
      ],
    },
  },
  {
    id: 3,
    leetcodeNumber: 88,
    title: "合并两个有序数组",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.TWO_POINTERS, SolutionMethod.SORTING],
    description: `给你两个按 非递减顺序 排列的整数数组 nums1 和 nums2，另有两个整数 m 和 n ，分别表示 nums1 和 nums2 中的元素数目。

请你合并 nums2 到 nums1 中，使合并后的数组同样按 非递减顺序 排列。

注意：最终，合并后数组不应由函数返回，而是存储在数组 nums1 中。为了应对这种情况，nums1 的初始长度为 m + n，其中前 m 个元素表示应合并的元素，后 n 个元素为 0 ，应忽略。nums2 的长度为 n 。`,
    examples: [
      {
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        output: "[1,2,2,3,5,6]",
        explanation: "需要合并 [1,2,3] 和 [2,5,6]。合并结果是 [1,2,2,3,5,6]",
      },
      {
        input: "nums1 = [1], m = 1, nums2 = [], n = 0",
        output: "[1]",
      },
      {
        input: "nums1 = [0], m = 0, nums2 = [1], n = 1",
        output: "[1]",
      },
    ],
    constraints: [
      "nums1.length == m + n",
      "nums2.length == n",
      "0 <= m, n <= 200",
      "1 <= m + n <= 200",
    ],
    hints: [
      "你可以使用双指针从后向前遍历",
      "从后向前可以避免覆盖 nums1 中还未处理的元素",
    ],
    solution: {
      methodName: "双指针（从后向前）",
      methodDescription:
        "从后向前遍历两个数组，每次选择较大的元素放入 nums1 的末尾。这样可以避免额外空间，且不会覆盖未处理的元素。",
      code: `function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let p1 = m - 1;  // nums1 的有效元素末尾
  let p2 = n - 1;  // nums2 的末尾
  let p = m + n - 1;  // 合并后的末尾位置
  
  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      nums1[p] = nums1[p1];
      p1--;
    } else {
      nums1[p] = nums2[p2];
      p2--;
    }
    p--;
  }
}`,
      language: "typescript",
      keyLines: [2, 3, 4, 7, 8, 10, 11],
      steps: [
        "初始化三个指针：p1 指向 nums1 有效元素末尾，p2 指向 nums2 末尾，p 指向合并位置末尾",
        "从后向前遍历，比较 nums1[p1] 和 nums2[p2]",
        "  • 如果 nums1[p1] > nums2[p2]，将 nums1[p1] 放到 p 位置，p1--",
        "  • 否则，将 nums2[p2] 放到 p 位置，p2--",
        "p-- 移动合并位置指针",
        "重复直到 nums2 中所有元素都被处理（p2 < 0）",
      ],
      advantages: [
        "原地操作：不需要额外空间，空间复杂度 O(1)",
        "不会覆盖：从后向前避免覆盖未处理元素",
        "思路巧妙：将难题转化为简单的比较和移动",
      ],
      timeComplexity: {
        value: "O(m+n)",
        description: "需要遍历两个数组的所有元素",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个指针变量，原地修改数组",
      },
      comparisons: [
        {
          name: "合并后排序",
          description: "先将 nums2 复制到 nums1，然后排序",
          timeComplexity: "O((m+n)log(m+n))",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["实现简单"],
          cons: ["时间复杂度高", "没有利用有序性"],
        },
        {
          name: "双指针从后向前",
          description: "利用数组有序性，从后向前合并",
          timeComplexity: "O(m+n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["时间复杂度最优", "空间复杂度最优", "面试常考"],
          cons: ["需要理解从后向前的思路"],
        },
      ],
    },
  },
  {
    id: 6,
    leetcodeNumber: 11,
    title: "盛最多水的容器",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.TWO_POINTERS, SolutionMethod.GREEDY],
    description: `给定一个长度为 n 的整数数组 height。有 n 条垂线，第 i 条线的两个端点是 (i, 0) 和 (i, height[i])。

找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。

返回容器可以储存的最大水量。

说明：你不能倾斜容器。`,
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation:
          "图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49",
      },
      {
        input: "height = [1,1]",
        output: "1",
      },
    ],
    constraints: [
      "n == height.length",
      "2 <= n <= 10⁵",
      "0 <= height[i] <= 10⁴",
    ],
    hints: [
      "使用双指针，一个指向开始，一个指向末尾",
      "每次移动较短的那条线，因为容器的高度由较短的线决定",
      "计算当前容器能容纳的水量，并更新最大值",
    ],
    solution: {
      methodName: "双指针（贪心策略）",
      methodDescription:
        "使用双指针从两端向中间移动，每次移动高度较小的指针。这是因为容器的面积由较短的边决定，移动较长的边不可能获得更大的面积。",
      code: `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;
  
  while (left < right) {
    // 计算当前容器面积
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;
    maxArea = Math.max(maxArea, area);
    
    // 移动较短的指针
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  
  return maxArea;
}`,
      language: "typescript",
      keyLines: [7, 8, 9, 10, 13, 14, 16],
      steps: [
        "初始化双指针 left = 0, right = n-1，分别指向数组两端",
        "计算当前容器面积：宽度 = right - left，高度 = min(height[left], height[right])",
        "更新最大面积 maxArea = max(maxArea, 当前面积)",
        "移动较短的那一边的指针：",
        "  • 如果 height[left] < height[right]，left++",
        "  • 否则 right--",
        "重复步骤 2-4 直到 left >= right",
        "返回 maxArea",
      ],
      advantages: [
        "时间复杂度最优：只需遍历一次数组",
        "空间复杂度 O(1)：只使用了常数个变量",
        "贪心策略正确性：移动较短边是唯一可能获得更大面积的方式",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "双指针从两端向中间移动，每个元素最多访问一次",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "暴力解法（双重循环）",
          description: "枚举所有可能的两条线组合",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["简单直接"],
          cons: ["时间复杂度高", "数据量大时超时"],
        },
        {
          name: "双指针（贪心）",
          description: "从两端向中间移动，每次移动较短的边",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["时间复杂度最优", "空间效率高", "思路巧妙"],
          cons: ["需要理解贪心策略的正确性"],
        },
      ],
    },
  },
  {
    id: 7,
    leetcodeNumber: 283,
    title: "移动零",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

请注意，必须在不复制数组的情况下原地对数组进行操作。`,
    examples: [
      {
        input: "nums = [0,1,0,3,12]",
        output: "[1,3,12,0,0]",
      },
      {
        input: "nums = [0]",
        output: "[0]",
      },
    ],
    constraints: ["1 <= nums.length <= 10⁴", "-2³¹ <= nums[i] <= 2³¹ - 1"],
    hints: [
      "使用双指针，一个指针用于遍历数组，另一个指针用于记录非零元素的位置",
      "遍历时，将非零元素移动到前面，最后将剩余位置填充为 0",
    ],
    solution: {
      methodName: "双指针（快慢指针）",
      methodDescription:
        "使用快慢指针，slow 指向下一个非零元素应该放置的位置，fast 遍历数组。遇到非零元素时交换，保持非零元素的相对顺序。",
      code: `function moveZeroes(nums: number[]): void {
  let slow = 0; // 慢指针：指向下一个非零元素应该放置的位置
  
  // 快指针遍历数组
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      // 交换非零元素到前面
      [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
      slow++;
    }
  }
}`,
      language: "typescript",
      keyLines: [2, 5, 6, 7, 8],
      steps: [
        "初始化慢指针 slow = 0，快指针 fast 从 0 开始遍历",
        "遍历数组，对于每个元素 nums[fast]：",
        "  • 如果 nums[fast] !== 0，交换 nums[slow] 和 nums[fast]",
        "  • slow++ 指向下一个位置",
        "  • fast++ 继续遍历",
        "遍历结束后，所有非零元素都被移到前面，零自动在后面",
      ],
      advantages: [
        "时间复杂度最优：只需遍历一次数组",
        "空间复杂度 O(1)：原地修改，只使用了两个指针",
        "保持相对顺序：非零元素的顺序不变",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要遍历数组一次，n 为数组长度",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "辅助数组法",
          description: "创建新数组，先放非零元素再填充零",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["思路简单"],
          cons: ["需要额外空间", "不符合原地操作要求"],
        },
        {
          name: "双指针（快慢指针）",
          description: "原地交换，保持相对顺序",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["原地操作", "空间效率高", "一次遍历"],
          cons: ["需要理解双指针思想"],
        },
      ],
    },
  },
  {
    id: 8,
    leetcodeNumber: 121,
    title: "买卖股票的最佳时机",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING, SolutionMethod.GREEDY],
    description: `给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。

你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation:
          "在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5。注意利润不能是 7-1 = 6，因为卖出价格需要大于买入价格",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "在这种情况下，没有交易完成，所以最大利润为 0",
      },
    ],
    constraints: ["1 <= prices.length <= 10⁵", "0 <= prices[i] <= 10⁴"],
    hints: [
      "维护一个变量记录目前为止的最低价格",
      "遍历数组时，计算当前价格卖出的利润",
      "更新最大利润",
    ],
    solution: {
      methodName: "一次遍历（贪心思想）",
      methodDescription:
        "只需要遍历一次价格数组，维护最低价格和最大利润。对于每个价格，计算如果今天卖出能获得的利润，并更新最大利润。",
      code: `function maxProfit(prices: number[]): number {
  let minPrice = prices[0];
  let maxProfit = 0;
  
  for (let i = 1; i < prices.length; i++) {
    // 计算当前卖出的利润
    const profit = prices[i] - minPrice;
    maxProfit = Math.max(maxProfit, profit);
    
    // 更新最低价格
    minPrice = Math.min(minPrice, prices[i]);
  }
  
  return maxProfit;
}`,
      language: "typescript",
      keyLines: [2, 3, 6, 7, 10],
      steps: [
        "初始化 minPrice 为第一个价格，maxProfit 为 0",
        "从第二天开始遍历价格数组",
        "  • 计算今天卖出的利润：profit = prices[i] - minPrice",
        "  • 更新最大利润：maxProfit = max(maxProfit, profit)",
        "  • 更新最低价格：minPrice = min(minPrice, prices[i])",
        "返回 maxProfit",
      ],
      advantages: [
        "时间复杂度最优：只需遍历一次数组 O(n)",
        "空间复杂度 O(1)：只使用了两个变量",
        "贪心策略：总是在最低点买入，在之后的最高点卖出",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "只需遍历价格数组一次，n 为数组长度",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "暴力解法（双重循环）",
          description: "枚举所有买入卖出的组合",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["思路简单直接"],
          cons: ["效率低", "数据量大时超时"],
        },
        {
          name: "一次遍历（贪心）",
          description: "维护最低价格和最大利润",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["时间空间复杂度都最优", "思路清晰", "最佳解法"],
          cons: ["需要理解贪心思想"],
        },
      ],
    },
  },
  {
    id: 10,
    leetcodeNumber: 53,
    title: "最大子数组和",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [
      SolutionMethod.DYNAMIC_PROGRAMMING,
      SolutionMethod.DIVIDE_CONQUER,
    ],
    description: `给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组 是数组中的一个连续部分。`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "连续子数组 [4,-1,2,1] 的和最大，为 6",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
      },
    ],
    constraints: ["1 <= nums.length <= 10⁵", "-10⁴ <= nums[i] <= 10⁴"],
    hints: [
      "使用动态规划：dp[i] 表示以第 i 个元素结尾的最大子数组和",
      "状态转移方程：dp[i] = max(dp[i-1] + nums[i], nums[i])",
      "可以用一个变量优化空间复杂度到 O(1)",
    ],
    solution: {
      methodName: "动态规划（Kadane算法）",
      methodDescription:
        "维护当前位置结尾的最大子数组和，对于每个元素，选择是加入前面的子数组，还是重新开始一个新的子数组。这就是著名的 Kadane 算法。",
      code: `function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // 选择加入前面的子数组，或重新开始
    currentSum = Math.max(currentSum + nums[i], nums[i]);
    // 更新最大和
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}`,
      language: "typescript",
      keyLines: [2, 3, 7, 9],
      steps: [
        "初始化 maxSum 和 currentSum 为第一个元素",
        "从第二个元素开始遍历数组",
        "对于每个元素 nums[i]：",
        "  • 选择是否加入前面的子数组：currentSum = max(currentSum + nums[i], nums[i])",
        "  • 如果 currentSum + nums[i] > nums[i]，说明前面的子数组和是正贡献，加入",
        "  • 否则，从当前元素重新开始",
        "  • 更新全局最大和：maxSum = max(maxSum, currentSum)",
        "返回 maxSum",
      ],
      advantages: [
        "时间复杂度最优：只需遍历一次数组 O(n)",
        "空间复杂度 O(1)：只使用了两个变量",
        "经典算法：Kadane 算法是解决最大子数组和的标准方法",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "只需遍历数组一次，n 为数组长度",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "暴力解法（三重循环）",
          description: "枚举所有可能的子数组",
          timeComplexity: "O(n³)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["思路直接"],
          cons: ["效率极低", "会超时"],
        },
        {
          name: "动态规划（Kadane算法）",
          description: "维护当前位置结尾的最大子数组和",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["时空复杂度都最优", "经典算法", "最佳解法"],
          cons: ["需要理解动态规划思想"],
        },
        {
          name: "分治法",
          description: "递归地将数组分成两半，分别求解",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(log n)",
          isRecommended: false,
          pros: ["体现分治思想"],
          cons: ["时间和空间复杂度都不如动态规划"],
        },
      ],
    },
  },
  {
    id: 13,
    leetcodeNumber: 26,
    title: "删除排序数组中的重复项",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给你一个升序排列的数组 nums ，请你原地删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。元素的相对顺序应该保持一致。

由于在某些语言中不能改变数组的长度，所以必须将结果放在数组nums的第一部分。更规范地说，如果在删除重复项之后有 k 个元素，那么 nums 的前 k 个元素应该保存最终结果。`,
    examples: [
      {
        input: "nums = [1,1,2]",
        output: "2, nums = [1,2,_]",
        explanation:
          "函数应该返回新的长度 2，并且原数组 nums 的前两个元素被修改为 1, 2。",
      },
      {
        input: "nums = [0,0,1,1,1,2,2,3,3,4]",
        output: "5, nums = [0,1,2,3,4,_,_,_,_,_]",
      },
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10⁴",
      "-100 <= nums[i] <= 100",
      "nums 已按升序排列",
    ],
    hints: [
      "使用双指针，一个指针遍历数组，一个指针指向不重复元素的位置",
      "因为数组已排序，重复元素一定相邻",
    ],
    solution: {
      methodName: "双指针（快慢指针）",
      methodDescription:
        "使用快慢指针，慢指针指向不重复元素应该存放的位置，快指针遍历数组。当发现新元素时，将其复制到慢指针位置。",
      code: `function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;
  
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) {
      nums[k] = nums[i];
      k++;
    }
  }
  
  return k;
}`,
      language: "typescript",
      keyLines: [5, 6, 7],
      steps: [
        "初始化慢指针 k = 1（第一个元素必然不重复）",
        "遍历数组（从索引1开始）",
        "  • 如果当前元素与前一个不重复元素不同",
        "  • 将当前元素复制到位置 k",
        "  • k++",
        "返回 k（不重复元素的个数）",
      ],
      advantages: [
        "原地修改：O(1) 额外空间",
        "简单高效：一次遍历",
        "最优解法：时空复杂度都最优",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "只需遍历数组一次",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "双指针",
          description: "快慢指针原地删除重复项",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "原地修改"],
          cons: ["无"],
        },
      ],
    },
  },
  {
    id: 14,
    leetcodeNumber: 35,
    title: "搜索插入位置",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BINARY_SEARCH],
    description: `给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 O(log n) 的算法。`,
    examples: [
      {
        input: "nums = [1,3,5,6], target = 5",
        output: "2",
      },
      {
        input: "nums = [1,3,5,6], target = 2",
        output: "1",
      },
      {
        input: "nums = [1,3,5,6], target = 7",
        output: "4",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁴",
      "-10⁴ <= nums[i] <= 10⁴",
      "nums 为无重复元素的升序排列数组",
      "-10⁴ <= target <= 10⁴",
    ],
    hints: [
      "题目要求 O(log n) 时间复杂度，应该使用二分查找",
      "如果没找到目标值，left指针就是插入位置",
    ],
    solution: {
      methodName: "二分查找",
      methodDescription:
        "标准的二分查找算法。如果找到目标值返回索引，如果没找到，left 指针就是目标值应该插入的位置。",
      code: `function searchInsert(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return left;
}`,
      language: "typescript",
      keyLines: [6, 9, 11, 13, 17],
      steps: [
        "初始化左右指针：left = 0, right = nums.length - 1",
        "当 left <= right 时循环：",
        "  • 计算中点 mid",
        "  • 如果 nums[mid] === target，返回 mid",
        "  • 如果 nums[mid] < target，在右半部分查找（left = mid + 1）",
        "  • 如果 nums[mid] > target，在左半部分查找（right = mid - 1）",
        "如果未找到，返回 left（插入位置）",
      ],
      advantages: [
        "时间最优：O(log n) 对数时间",
        "空间最优：O(1) 常数空间",
        "经典算法：二分查找标准应用",
      ],
      timeComplexity: {
        value: "O(log n)",
        description: "每次将搜索范围减半",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "线性查找",
          description: "从头到尾遍历数组",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["实现简单"],
          cons: ["不满足题目O(log n)要求"],
        },
        {
          name: "二分查找",
          description: "利用有序性质，每次折半搜索",
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["满足题目要求", "最优解法"],
          cons: ["需要数组有序"],
        },
      ],
    },
  },
  {
    id: 15,
    leetcodeNumber: 66,
    title: "加一",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY, Category.MATH],
    methods: [SolutionMethod.ITERATION],
    description: `给定一个由整数组成的非空数组所表示的非负整数，在该数的基础上加一。

最高位数字存放在数组的首位， 数组中每个元素只存储单个数字。

你可以假设除了整数 0 之外，这个整数不会以零开头。`,
    examples: [
      {
        input: "digits = [1,2,3]",
        output: "[1,2,4]",
        explanation: "输入数组表示数字 123。",
      },
      {
        input: "digits = [4,3,2,1]",
        output: "[4,3,2,2]",
        explanation: "输入数组表示数字 4321。",
      },
      {
        input: "digits = [9]",
        output: "[1,0]",
        explanation: "输入数组表示数字 9。",
      },
    ],
    constraints: ["1 <= digits.length <= 100", "0 <= digits[i] <= 9"],
    hints: [
      "从数组末尾开始处理，模拟加法进位",
      "注意处理连续进位的情况（如999+1）",
      "如果最后还有进位，需要在数组开头插入1",
    ],
    solution: {
      methodName: "模拟加法（从后向前）",
      methodDescription:
        "从数组末尾开始，模拟加法进位过程。如果当前位是9则变为0并继续进位，否则加1后直接返回。如果所有位都是9，最后需要在开头插入1。",
      code: `function plusOne(digits: number[]): number[] {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  
  // 所有位都是9的情况
  return [1, ...digits];
}`,
      language: "typescript",
      keyLines: [2, 3, 4, 6, 10],
      steps: [
        "从数组末尾开始遍历",
        "  • 如果当前位 < 9，加1后直接返回",
        "  • 如果当前位 = 9，变为0并继续进位",
        "如果循环结束还没返回，说明所有位都是9",
        "在数组开头插入1并返回",
      ],
      advantages: [
        "简洁高效：一次遍历",
        "提前返回：不是9时立即结束",
        "处理溢出：优雅处理999+1的情况",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "最坏情况需要遍历所有位",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "原地修改，除返回值外不需要额外空间",
      },
      comparisons: [
        {
          name: "模拟加法",
          description: "从后向前模拟进位",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "代码简洁"],
          cons: ["无"],
        },
      ],
    },
  },
  {
    id: 16,
    leetcodeNumber: 167,
    title: "两数之和 II - 输入有序数组",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给你一个下标从 1 开始的整数数组 numbers ，该数组已按 非递减顺序排列  ，请你从数组中找出满足相加之和等于特定目标数 target 的两个数。

如果设这两个数分别是 numbers[index1] 和 numbers[index2] ，则 1 <= index1 < index2 <= numbers.length 。

以长度为 2 的整数数组 [index1, index2] 的形式返回这两个整数的下标 index1 和 index2。

你可以假设每个输入 只对应唯一的答案 ，而且你 不可以 重复使用相同的元素。

你所设计的解决方案必须只使用常量级的额外空间。`,
    examples: [
      {
        input: "numbers = [2,7,11,15], target = 9",
        output: "[1,2]",
        explanation:
          "2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。返回 [1, 2] 。",
      },
      {
        input: "numbers = [2,3,4], target = 6",
        output: "[1,3]",
        explanation:
          "2 与 4 之和等于目标数 6 。因此 index1 = 1, index2 = 3 。返回 [1, 3] 。",
      },
      {
        input: "numbers = [-1,0], target = -1",
        output: "[1,2]",
        explanation:
          "-1 与 0 之和等于目标数 -1 。因此 index1 = 1, index2 = 2 。返回 [1, 2] 。",
      },
    ],
    constraints: [
      "2 <= numbers.length <= 3 * 10⁴",
      "-1000 <= numbers[i] <= 1000",
      "numbers 按 非递减顺序 排列",
      "-1000 <= target <= 1000",
      "仅存在一个有效答案",
    ],
    hints: [
      "利用数组有序的特性",
      "使用双指针，一个指向头，一个指向尾",
      "如果和大于目标值，移动右指针；如果和小于目标值，移动左指针",
    ],
    solution: {
      methodName: "双指针",
      methodDescription:
        "由于数组有序，我们可以使用双指针。如果当前和大于目标值，说明需要更小的数，右指针左移；如果当前和小于目标值，说明需要更大的数，左指针右移。",
      code: `function twoSum(numbers: number[], target: number): number[] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    
    if (sum === target) {
      return [left + 1, right + 1];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return [];
}`,
      language: "typescript",
      keyLines: [5, 6, 8, 10, 12],
      steps: [
        "初始化左指针 left = 0，右指针 right = n - 1",
        "计算当前和 sum = numbers[left] + numbers[right]",
        "如果 sum === target，返回 [left + 1, right + 1]",
        "如果 sum < target，左指针右移（需要更大的数）",
        "如果 sum > target，右指针左移（需要更小的数）",
      ],
      advantages: [
        "时间复杂度 O(n)：最多遍历一次数组",
        "空间复杂度 O(1)：只使用了两个指针",
        "利用了数组的有序性",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "双指针最多遍历整个数组一次",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数级额外空间",
      },
      comparisons: [
        {
          name: "二分查找",
          description: "固定一个数，二分查找另一个数",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["也是一种解法"],
          cons: ["比双指针慢"],
        },
        {
          name: "双指针",
          description: "首尾指针向中间逼近",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "代码简洁"],
          cons: ["需要数组有序"],
        },
      ],
    },
  },
  {
    id: 17,
    leetcodeNumber: 118,
    title: "杨辉三角",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。

在「杨辉三角」中，每个数是它左上方和右上方的数的和。`,
    examples: [
      {
        input: "numRows = 5",
        output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]",
      },
      {
        input: "numRows = 1",
        output: "[[1]]",
      },
    ],
    constraints: ["1 <= numRows <= 30"],
    hints: ["每一行的首尾都是 1", "中间的数等于上一行左右两个数之和"],
    solution: {
      methodName: "动态规划",
      methodDescription:
        "根据杨辉三角的定义，第 i 行第 j 个数等于第 i-1 行第 j-1 个数和第 j 个数之和。",
      code: `function generate(numRows: number): number[][] {
  const result: number[][] = [];
  
  for (let i = 0; i < numRows; i++) {
    const row = new Array(i + 1).fill(1);
    
    for (let j = 1; j < i; j++) {
      row[j] = result[i - 1][j - 1] + result[i - 1][j];
    }
    
    result.push(row);
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [4, 7, 11],
      steps: [
        "初始化结果数组 result",
        "遍历每一行 i 从 0 到 numRows - 1",
        "  • 创建当前行，长度为 i + 1，首尾填充 1",
        "  • 对于中间的元素（j 从 1 到 i - 1），计算 row[j] = prevRow[j-1] + prevRow[j]",
        "  • 将当前行加入 result",
        "返回 result",
      ],
      advantages: ["直观：直接按照定义模拟", "高效：每个元素只计算一次"],
      timeComplexity: {
        value: "O(numRows²)",
        description: "需要计算总共 numRows * (numRows + 1) / 2 个数",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "不考虑返回值的空间，只用了常数级额外空间",
      },
      comparisons: [],
    },
  },
  {
    id: 18,
    leetcodeNumber: 122,
    title: "买卖股票的最佳时机 II",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.GREEDY],
    description: `给你一个整数数组 prices ，其中 prices[i] 表示某支股票第 i 天的价格。

在每一天，你可以决定是否购买和/或出售股票。你在任何时候 最多 只能持有 一股 股票。你也可以先购买，然后在 同一天 出售。

返回 你能获得的 最大 利润 。`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "7",
        explanation:
          "在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4 。随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6 - 3 = 3 。总利润 = 4 + 3 = 7 。",
      },
      {
        input: "prices = [1,2,3,4,5]",
        output: "4",
        explanation:
          "在第 1 天（股票价格 = 1）的时候买入，在第 5 天 （股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4 。总利润 = 4 。",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation:
          "在这种情况下，交易无法获得正利润，所以不参与交易可以获得最大利润，最大利润为 0 。",
      },
    ],
    constraints: ["1 <= prices.length <= 3 * 10⁴", "0 <= prices[i] <= 10⁴"],
    hints: [
      "只要后一天的价格比前一天高，就有利润",
      "贪心策略：收集所有正向的利润",
    ],
    solution: {
      methodName: "贪心算法",
      methodDescription:
        "由于不限制交易次数，只要今天的价格比昨天高，我们就可以在昨天买入今天卖出（或者等价于持有到今天）。这等价于收集所有上涨区间的利润。",
      code: `function maxProfit(prices: number[]): number {
  let profit = 0;
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  
  return profit;
}`,
      language: "typescript",
      keyLines: [4, 5, 6],
      steps: [
        "初始化总利润 profit = 0",
        "从第 2 天开始遍历价格数组",
        "  • 如果今天价格 > 昨天价格，说明有利润",
        "  • 将差价加入总利润：profit += prices[i] - prices[i-1]",
        "返回 profit",
      ],
      advantages: ["极其简单：代码非常短", "效率高：一次遍历"],
      timeComplexity: {
        value: "O(n)",
        description: "遍历一次数组",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用常数额外空间",
      },
      comparisons: [
        {
          name: "动态规划",
          description: "维护持有和不持有两种状态",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n) 或 O(1)",
          isRecommended: false,
          pros: ["通用性强"],
          cons: ["代码比贪心复杂"],
        },
        {
          name: "贪心算法",
          description: "收集所有上涨利润",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["代码最简", "最优解"],
          cons: ["需要理解贪心逻辑"],
        },
      ],
    },
  },
  {
    id: 19,
    leetcodeNumber: 169,
    title: "多数元素",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY, Category.HASH_TABLE],
    methods: [SolutionMethod.ITERATION],
    description: `给定一个大小为 n 的数组 nums ，返回其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素。

你可以假设数组是非空的，并且给定的数组总是存在多数元素。`,
    examples: [
      {
        input: "nums = [3,2,3]",
        output: "3",
      },
      {
        input: "nums = [2,2,1,1,1,2,2]",
        output: "2",
      },
    ],
    constraints: [
      "n == nums.length",
      "1 <= n <= 5 * 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
    ],
    hints: [
      "尝试排序，多数元素一定在中间",
      "使用摩尔投票算法可以达到 O(n) 时间和 O(1) 空间",
    ],
    solution: {
      methodName: "摩尔投票法",
      methodDescription:
        "维护一个候选众数 candidate 和计数 count。遇到相同的数 count+1，不同的数 count-1。当 count 为 0 时更换 candidate。由于众数超过一半，最后留下的 candidate 一定是众数。",
      code: `function majorityElement(nums: number[]): number {
  let candidate = nums[0];
  let count = 1;
  
  for (let i = 1; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i];
      count = 1;
    } else if (nums[i] === candidate) {
      count++;
    } else {
      count--;
    }
  }
  
  return candidate;
}`,
      language: "typescript",
      keyLines: [2, 3, 6, 7, 8, 10],
      steps: [
        "初始化 candidate = nums[0], count = 1",
        "遍历数组剩余元素：",
        "  • 如果 count === 0，更新 candidate = current, count = 1",
        "  • 如果 current === candidate，count++",
        "  • 否则 count--",
        "返回 candidate",
      ],
      advantages: ["时间复杂度 O(n)", "空间复杂度 O(1)", "非常巧妙的算法"],
      timeComplexity: {
        value: "O(n)",
        description: "遍历一次数组",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了两个变量",
      },
      comparisons: [
        {
          name: "哈希表",
          description: "统计每个元素出现的次数",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["直观"],
          cons: ["需要额外空间"],
        },
        {
          name: "排序",
          description: "排序后取中间元素",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["代码极简"],
          cons: ["时间复杂度较高"],
        },
        {
          name: "摩尔投票法",
          description: "抵消非众数",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["时空最优"],
          cons: ["理解稍难"],
        },
      ],
    },
  },
  {
    id: 27,
    leetcodeNumber: 217,
    title: "存在重复元素",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY, Category.HASH_TABLE],
    methods: [SolutionMethod.ITERATION],
    description: `给你一个整数数组 nums 。如果任一值在数组中出现 至少两次 ，返回 true ；如果数组中每个元素互不相同，返回 false 。`,
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "true",
      },
      {
        input: "nums = [1,2,3,4]",
        output: "false",
      },
      {
        input: "nums = [1,1,1,3,3,4,3,2,4,2]",
        output: "true",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁵",
      "-10⁹ <= nums[i] <= 10⁹",
    ],
    hints: [
      "使用哈希集合可以快速判断是否出现过",
      "遍历数组，检查每个元素是否在集合中",
      "如果在集合中，说明重复；否则加入集合",
    ],
    solution: {
      methodName: "哈希集合",
      methodDescription:
        "使用哈希集合（Set）记录已经遍历过的元素。对于每个元素，如果已经在集合中，说明存在重复；否则将其加入集合。",
      code: `function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  
  return false;
}`,
      language: "typescript",
      keyLines: [2, 4, 5, 6, 7],
      steps: [
        "创建一个空的哈希集合 seen",
        "遍历数组中的每个数字",
        "  • 如果数字已在集合中，返回 true",
        "  • 否则，将数字加入集合",
        "遍历完成，返回 false",
      ],
      advantages: [
        "时间高效：O(n) 时间复杂度",
        "实现简单：直接使用 Set 数据结构",
        "逻辑清晰：一次遍历即可",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "遍历数组一次",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "最坏情况下需要存储所有元素",
      },
      comparisons: [
        {
          name: "暴力法",
          description: "双重循环检查每对元素",
          timeComplexity: "O(n²)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["不需要额外空间"],
          cons: ["效率极低"],
        },
        {
          name: "排序",
          description: "排序后检查相邻元素",
          timeComplexity: "O(n log n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["空间复杂度低"],
          cons: ["修改了原数组", "时间复杂度较高"],
        },
        {
          name: "哈希集合",
          description: "使用Set快速查找",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["最优时间复杂度", "代码简洁"],
          cons: ["需要额外空间"],
        },
      ],
    },
  },
  {
    id: 28,
    leetcodeNumber: 219,
    title: "存在重复元素 II",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY, Category.HASH_TABLE],
    methods: [SolutionMethod.SLIDING_WINDOW],
    description: `给你一个整数数组 nums 和一个整数 k ，判断数组中是否存在两个 不同的索引 i 和 j ，满足 nums[i] == nums[j] 且 abs(i - j) <= k 。如果存在，返回 true ；否则，返回 false 。`,
    examples: [
      {
        input: "nums = [1,2,3,1], k = 3",
        output: "true",
      },
      {
        input: "nums = [1,0,1,1], k = 1",
        output: "true",
      },
      {
        input: "nums = [1,2,3,1,2,3], k = 2",
        output: "false",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁵",
      "-10⁹ <= nums[i] <= 10⁹",
      "0 <= k <= 10⁵",
    ],
    hints: [
      "需要记录元素的索引位置",
      "使用哈希表存储每个元素最近出现的索引",
      "检查当前索引与之前索引的差值",
    ],
    solution: {
      methodName: "哈希表记录索引",
      methodDescription:
        "使用哈希表记录每个元素最近出现的索引位置。遍历数组时，如果当前元素已经出现过，检查索引差是否 <= k。",
      code: `function containsNearbyDuplicate(nums: number[], k: number): boolean {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    if (map.has(nums[i])) {
      if (i - map.get(nums[i])! <= k) {
        return true;
      }
    }
    map.set(nums[i], i);
  }
  
  return false;
}`,
      language: "typescript",
      keyLines: [2, 4, 5, 6, 9],
      steps: [
        "创建哈希表 map，存储元素到索引的映射",
        "遍历数组的每个位置 i",
        "  • 如果 nums[i] 在 map 中存在",
        "    - 检查 i - map.get(nums[i]) 是否 <= k",
        "    - 如果是，返回 true",
        "  • 更新/添加 nums[i] 的索引为 i",
        "遍历完成，返回 false",
      ],
      advantages: [
        "时间高效：O(n) 时间复杂度",
        "空间优化：只记录最近的索引",
        "逻辑清晰：一次遍历完成",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "遍历数组一次",
      },
      spaceComplexity: {
        value: "O(min(n, k))",
        description: "哈希表最多存储 min(n, k) 个元素",
      },
      comparisons: [
        {
          name: "暴力法",
          description: "对每个元素检查后续k个元素",
          timeComplexity: "O(n·k)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["不需要额外空间"],
          cons: ["效率低"],
        },
        {
          name: "哈希表记录索引",
          description: "记录每个元素最近的索引",
          timeComplexity: "O(n)",
          spaceComplexity: "O(min(n, k))",
          isRecommended: true,
          pros: ["最优解法", "一次遍历"],
          cons: ["需要额外空间"],
        },
        {
          name: "滑动窗口+Set",
          description: "维护大小为k的窗口",
          timeComplexity: "O(n)",
          spaceComplexity: "O(k)",
          isRecommended: false,
          pros: ["空间固定为O(k)"],
          cons: ["代码复杂", "需要维护窗口"],
        },
      ],
    },
  },
];
