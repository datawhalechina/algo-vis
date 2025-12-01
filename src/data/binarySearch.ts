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
      advantages: ["时间复杂度O(log n)", "空间复杂度O(1)", "适用于有序数组"],
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
      methodDescription:
        "对旋转数组使用二分查找，关键是判断哪一半是有序的，然后在有序的一半中判断目标值是否在范围内。",
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
  // Problem 116: 寻找旋转排序数组中的最小值
  {
    id: 116,
    leetcodeNumber: 153,
    title: "寻找旋转排序数组中的最小值",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BINARY_SEARCH],
    description: `已知一个长度为 n 的数组，预先按照升序排列，经由 1 到 n 次旋转后，得到输入数组。例如，原数组 nums = [0,1,2,4,5,6,7] 在变化后可能得到：
• 若旋转 4 次，则可以得到 [4,5,6,7,0,1,2]
• 若旋转 7 次，则可以得到 [0,1,2,4,5,6,7]

注意，数组 [a[0], a[1], a[2], ..., a[n-1]] 旋转一次的结果为数组 [a[n-1], a[0], a[1], a[2], ..., a[n-2]]。

给你一个元素值互不相同的数组 nums，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的最小元素。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。`,
    examples: [
      {
        input: "nums = [3,4,5,1,2]",
        output: "1",
        explanation: "原数组为 [1,2,3,4,5] ，旋转 3 次得到输入数组。",
      },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
      { input: "nums = [11,13,15,17]", output: "11" },
    ],
    constraints: [
      "n == nums.length",
      "1 <= n <= 5000",
      "-5000 <= nums[i] <= 5000",
      "nums 中的所有整数互不相同",
      "nums 原来是一个升序排序的数组，并进行了 1 至 n 次旋转",
    ],
    hints: ["二分查找", "比较中间元素和右边界", "最小值在旋转点右侧"],
    solution: {
      methodName: "二分查找",
      methodDescription:
        "使用二分查找，比较中间元素和右边界元素。如果nums[mid] > nums[right]，最小值在右半部分；否则在左半部分。",
      code: `function findMin(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] > nums[right]) {
      // 最小值在右半部分
      left = mid + 1;
    } else {
      // 最小值在左半部分（包括mid）
      right = mid;
    }
  }
  
  return nums[left];
}`,
      language: "typescript",
      keyLines: [4, 7, 10],
      steps: [
        "初始化left=0, right=n-1",
        "当left < right时循环",
        "计算mid = (left + right) / 2",
        "如果nums[mid] > nums[right]，最小值在右半部分，left = mid + 1",
        "否则最小值在左半部分，right = mid",
        "返回nums[left]",
      ],
      advantages: ["时间复杂度O(log n)", "空间复杂度O(1)", "二分查找最优解"],
      timeComplexity: { value: "O(log n)", description: "二分查找" },
      spaceComplexity: { value: "O(1)", description: "只使用常数空间" },
      comparisons: [],
    },
  },
  // Problem 123: 搜索二维矩阵
  {
    id: 123,
    leetcodeNumber: 74,
    title: "搜索二维矩阵",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY, Category.MATRIX],
    methods: [SolutionMethod.BINARY_SEARCH],
    description: `编写一个高效的算法来判断 m x n 矩阵中，是否存在一个目标值。该矩阵具有如下特性：

• 每行中的整数从左到右按升序排列。
• 每行的第一个整数大于前一行的最后一个整数。`,
    examples: [
      {
        input:
          "matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target = 5",
        output: "true",
      },
      {
        input:
          "matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target = 3",
        output: "false",
      },
    ],
    constraints: [
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 100",
      "-10⁴ <= matrix[i][j], target <= 10⁴",
    ],
    hints: [
      "二分查找",
      "将二维矩阵视为一维数组",
      "行索引 = mid / n，列索引 = mid % n",
    ],
    solution: {
      methodName: "二分查找",
      methodDescription:
        "将二维矩阵视为一维数组进行二分查找。行索引 = mid / n，列索引 = mid % n。",
      code: `function searchMatrix(matrix: number[][], target: number): boolean {
  const m = matrix.length;
  const n = matrix[0].length;
  let left = 0;
  let right = m * n - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const row = Math.floor(mid / n);
    const col = mid % n;
    const value = matrix[row][col];
    
    if (value === target) {
      return true;
    } else if (value < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return false;
}`,
      language: "typescript",
      keyLines: [5, 7, 8, 12],
      steps: [
        "将二维矩阵视为一维数组",
        "使用二分查找",
        "计算行索引 = mid / n，列索引 = mid % n",
        "比较并更新搜索范围",
      ],
      advantages: [
        "时间复杂度O(log(m×n))",
        "空间复杂度O(1)",
        "经典二分查找应用",
      ],
      timeComplexity: { value: "O(log(m×n))", description: "二分查找" },
      spaceComplexity: { value: "O(1)", description: "只使用常数空间" },
      comparisons: [],
    },
  },
  // Problem 125: 寻找两个正序数组的中位数
  {
    id: 125,
    leetcodeNumber: 4,
    title: "寻找两个正序数组的中位数",
    difficulty: Difficulty.HARD,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BINARY_SEARCH],
    description: `给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出并返回这两个正序数组的中位数。

算法的时间复杂度应该为 O(log (m+n))。`,
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "合并数组 = [1,2,3] ，中位数 2",
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "合并数组 = [1,2,3,4] ，中位数 (2 + 3) / 2 = 2.5",
      },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10⁶ <= nums1[i], nums2[i] <= 10⁶",
    ],
    hints: ["二分查找", "在两个数组中寻找分割点", "保证左右两部分元素数量相等"],
    solution: {
      methodName: "二分查找（分割数组）",
      methodDescription:
        "使用二分查找在较短的数组中寻找分割点，使得分割点左侧的元素都小于等于分割点右侧的元素。",
      code: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }
  
  const m = nums1.length;
  const n = nums2.length;
  let left = 0;
  let right = m;
  
  while (left <= right) {
    const partition1 = Math.floor((left + right) / 2);
    const partition2 = Math.floor((m + n + 1) / 2) - partition1;
    
    const maxLeft1 = partition1 === 0 ? -Infinity : nums1[partition1 - 1];
    const minRight1 = partition1 === m ? Infinity : nums1[partition1];
    const maxLeft2 = partition2 === 0 ? -Infinity : nums2[partition2 - 1];
    const minRight2 = partition2 === n ? Infinity : nums2[partition2];
    
    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
      if ((m + n) % 2 === 0) {
        return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
      } else {
        return Math.max(maxLeft1, maxLeft2);
      }
    } else if (maxLeft1 > minRight2) {
      right = partition1 - 1;
    } else {
      left = partition1 + 1;
    }
  }
  
  return 0;
}`,
      language: "typescript",
      keyLines: [9, 13, 18],
      steps: [
        "确保nums1是较短的数组",
        "在nums1中使用二分查找寻找分割点",
        "计算nums2的分割点，使得左右两部分元素数量相等",
        "检查分割点是否满足条件，调整搜索范围",
        "计算中位数",
      ],
      advantages: [
        "时间复杂度O(log(min(m,n)))",
        "空间复杂度O(1)",
        "经典二分查找应用",
      ],
      timeComplexity: {
        value: "O(log(min(m,n)))",
        description: "在较短的数组上二分查找",
      },
      spaceComplexity: { value: "O(1)", description: "只使用常数空间" },
      comparisons: [],
    },
  },
];
