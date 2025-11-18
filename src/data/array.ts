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
];
