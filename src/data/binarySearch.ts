import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 二分查找类题目数据
 */
export const binarySearchProblems: Problem[] = [
  // Problem 94: 搜索插入位置
  {
    id: 94,
    leetcodeNumber: 35,
    title: "搜索插入位置",
    difficulty: Difficulty.EASY,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BINARY_SEARCH],
    description: `给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 O(log n) 的算法。`,
    examples: [
      { input: "nums = [1,3,5,6], target = 5", output: "2" },
      { input: "nums = [1,3,5,6], target = 2", output: "1" },
      { input: "nums = [1,3,5,6], target = 7", output: "4" },
    ],
    constraints: [
      "1 <= nums.length <= 10⁴",
      "-10⁴ <= nums[i] <= 10⁴",
      "nums 为无重复元素的升序排列数组",
      "-10⁴ <= target <= 10⁴",
    ],
    hints: ["使用二分查找", "注意边界条件"],
    solution: {
      methodName: "二分查找",
      methodDescription: "使用二分查找算法在有序数组中定位目标值或插入位置。",
      code: `function searchInsert(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1;
  
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
      keyLines: [4, 7, 9, 11, 15],
      steps: [
        "初始化左右指针",
        "计算中间位置",
        "如果中间元素等于目标值，返回索引",
        "如果中间元素小于目标值，搜索右半部分",
        "如果中间元素大于目标值，搜索左半部分",
        "循环结束时left就是插入位置",
      ],
      advantages: [
        "时间复杂度O(log n)",
        "空间复杂度O(1)",
        "适用于有序数组",
      ],
      timeComplexity: { value: "O(log n)", description: "二分查找" },
      spaceComplexity: { value: "O(1)", description: "只使用常数空间" },
      comparisons: [],
    },
  },
  // Problem 95: 搜索旋转排序数组
  {
    id: 95,
    leetcodeNumber: 33,
    title: "搜索旋转排序数组",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BINARY_SEARCH],
    description: `整数数组 nums 按升序排列，数组中的值互不相同。

在传递给函数之前，nums 在预先未知的某个下标 k（0 <= k < nums.length）上进行了旋转，使数组变为 [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]（下标从 0 开始计数）。

给你旋转后的数组 nums 和一个整数 target，如果 nums 中存在这个目标值 target，则返回它的下标，否则返回 -1。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。`,
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
      { input: "nums = [1], target = 0", output: "-1" },
    ],
    constraints: [
      "1 <= nums.length <= 5000",
      "-10⁴ <= nums[i] <= 10⁴",
      "nums 中的每个值都独一无二",
      "题目数据保证 nums 在预先未知的某个下标上进行了旋转",
      "-10⁴ <= target <= 10⁴",
    ],
    hints: ["二分查找", "判断有序区间", "在有序区间内搜索"],
    solution: {
      methodName: "二分查找",
      methodDescription: "对旋转数组使用二分查找，关键是判断哪一半是有序的，然后在有序的一半中判断目标值是否在范围内。",
      code: `function search(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    }
    
    // 判断左半部分是否有序
    if (nums[left] <= nums[mid]) {
      // 左半部分有序，判断target是否在左半部分
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // 右半部分有序，判断target是否在右半部分
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  
  return -1;
}`,
      language: "typescript",
      keyLines: [12, 14, 21],
      steps: [
        "使用二分查找的框架",
        "判断哪一半是有序的（通过比较nums[left]和nums[mid]）",
        "在有序的一半中判断target是否在范围内",
        "如果在范围内，搜索该半边；否则搜索另一半",
        "直到找到target或搜索完毕",
      ],
      advantages: [
        "时间复杂度O(log n)",
        "巧妙利用旋转数组的性质",
        "空间复杂度O(1)",
      ],
      timeComplexity: { value: "O(log n)", description: "二分查找" },
      spaceComplexity: { value: "O(1)", description: "只使用常数空间" },
      comparisons: [],
    },
  },
];
