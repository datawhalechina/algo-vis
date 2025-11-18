import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

export const problems: Problem[] = [
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
    id: 2,
    leetcodeNumber: 206,
    title: "反转链表",
    difficulty: Difficulty.EASY,
    category: [Category.LINKED_LIST],
    methods: [
      SolutionMethod.TWO_POINTERS,
      SolutionMethod.ITERATION,
      SolutionMethod.RECURSION,
    ],
    description: `给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
      },
      {
        input: "head = []",
        output: "[]",
      },
    ],
    constraints: [
      "链表中节点的数目范围是 [0, 5000]",
      "-5000 <= Node.val <= 5000",
    ],
    hints: [
      "可以使用迭代或递归两种方法",
      "迭代法需要用三个指针：prev, curr, next",
      "递归法要理解递归返回后的操作",
    ],
    solution: {
      methodName: "迭代法（双指针）",
      methodDescription:
        "使用双指针迭代遍历链表，逐个反转节点的指向。这是最直观、最容易理解的解法。",
      code: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr: ListNode | null = head;
  
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  
  return prev;
}`,
      language: "typescript",
      keyLines: [6, 7, 8, 9], // 关键代码行：保存next、反转指针、移动prev、移动curr
      steps: [
        "初始化两个指针：prev = null（前驱节点），curr = head（当前节点）",
        "遍历链表，对于每个节点：",
        "  • 先保存下一个节点：next = curr.next",
        "  • 反转当前节点的指针：curr.next = prev",
        "  • 移动两个指针：prev = curr, curr = next",
        "当 curr 为 null 时，prev 就是新的头节点",
      ],
      advantages: [
        "空间复杂度低：只需要常数级别的额外空间",
        "逻辑清晰：容易理解和实现",
        "适合面试：是面试官最期待看到的解法",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要遍历链表一次，n 为链表长度",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个指针变量",
      },
      comparisons: [
        {
          name: "迭代法（双指针）",
          description: "使用两个指针遍历并反转",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["空间效率高", "易于理解", "最常用"],
          cons: ["需要仔细处理指针"],
        },
        {
          name: "递归法",
          description: "利用递归栈反转链表",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["代码简洁", "体现递归思想"],
          cons: ["递归栈空间开销", "可能栈溢出"],
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
    id: 4,
    leetcodeNumber: 20,
    title: "有效的括号",
    difficulty: Difficulty.EASY,
    category: [Category.STRING, Category.STACK],
    methods: [SolutionMethod.ITERATION],
    description: `给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。

有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。`,
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
      {
        input: 's = "([)]"',
        output: "false",
      },
      {
        input: 's = "{[]}"',
        output: "true",
      },
    ],
    constraints: ["1 <= s.length <= 10⁴", "s 仅由括号 '()[]{}' 组成"],
    hints: [
      "使用栈（Stack）数据结构",
      "遇到左括号就入栈，遇到右括号就检查栈顶是否匹配",
    ],
    solution: {
      methodName: "栈（Stack）",
      methodDescription:
        "使用栈来保存左括号，遇到右括号时检查栈顶的左括号是否匹配。栈的先进后出特性完美契合括号配对的嵌套规则。",
      code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  
  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      // 左括号入栈
      stack.push(char);
    } else {
      // 右括号：检查栈顶
      if (stack.length === 0 || stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
}`,
      language: "typescript",
      keyLines: [11, 15],
      steps: [
        "创建一个空栈和括号映射表",
        "遍历字符串中的每个字符",
        "  • 如果是左括号 ( [ {，将其入栈",
        "  • 如果是右括号 ) ] }：",
        "    - 检查栈是否为空（若为空说明没有对应的左括号）",
        "    - 弹出栈顶元素，检查是否与当前右括号匹配",
        "    - 不匹配则返回 false",
        "遍历结束后，栈应为空（否则有未匹配的左括号）",
      ],
      advantages: [
        "时间效率高：只需遍历一次字符串",
        "逻辑清晰：栈的先进后出完美匹配括号嵌套规则",
        "易于扩展：可以轻松支持更多类型的括号",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "n 为字符串长度，需要遍历字符串一次",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "最坏情况下，栈中可能存储所有左括号",
      },
    },
  },
  {
    id: 5,
    leetcodeNumber: 70,
    title: "爬楼梯",
    difficulty: Difficulty.EASY,
    category: [Category.MATH],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING, SolutionMethod.RECURSION],
    description: `假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？`,
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "有两种方法可以爬到楼顶：1. 1 阶 + 1 阶  2. 2 阶",
      },
      {
        input: "n = 3",
        output: "3",
        explanation:
          "有三种方法可以爬到楼顶：1. 1 阶 + 1 阶 + 1 阶  2. 1 阶 + 2 阶  3. 2 阶 + 1 阶",
      },
    ],
    constraints: ["1 <= n <= 45"],
    hints: [
      "这是一个斐波那契数列问题",
      "f(n) = f(n-1) + f(n-2)",
      "可以用动态规划优化空间复杂度",
    ],
    solution: {
      methodName: "动态规划（优化空间）",
      methodDescription:
        "到达第 n 阶的方法数 = 到达第 n-1 阶的方法数 + 到达第 n-2 阶的方法数。这是斐波那契数列，可以用两个变量优化空间。",
      code: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  
  let prev2 = 1;  // f(1)
  let prev1 = 2;  // f(2)
  let current = 0;
  
  for (let i = 3; i <= n; i++) {
    current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return current;
}`,
      language: "typescript",
      keyLines: [4, 5, 9, 10, 11],
      steps: [
        "处理基础情况：n=1 时有 1 种方法，n=2 时有 2 种方法",
        "初始化：prev2 = 1（第1阶）, prev1 = 2（第2阶）",
        "从第 3 阶开始循环计算",
        "  • current = prev1 + prev2（状态转移方程）",
        "  • 更新：prev2 = prev1, prev1 = current",
        "返回 current（第 n 阶的方法数）",
      ],
      advantages: [
        "空间优化：只用 3 个变量，空间复杂度 O(1)",
        "时间高效：只需遍历一次，时间复杂度 O(n)",
        "思路清晰：典型的动态规划入门题",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要计算从 3 到 n 的所有值",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "递归（暴力）",
          description: "直接递归调用 f(n) = f(n-1) + f(n-2)",
          timeComplexity: "O(2^n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["代码简洁"],
          cons: ["大量重复计算", "效率极低"],
        },
        {
          name: "动态规划（数组）",
          description: "使用数组存储所有中间结果",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["易于理解"],
          cons: ["空间占用较大"],
        },
        {
          name: "动态规划（优化空间）",
          description: "只保存最近两个状态",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["时空复杂度都最优", "最佳解法"],
          cons: ["需要理解状态转移"],
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
        explanation: "图中垂直线代表输入数组 [1,8,6,2,5,4,8,3,7]。在此情况下，容器能够容纳水（表示为蓝色部分）的最大值为 49",
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
    constraints: [
      "1 <= nums.length <= 10⁴",
      "-2³¹ <= nums[i] <= 2³¹ - 1",
    ],
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
        explanation: "在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5。注意利润不能是 7-1 = 6，因为卖出价格需要大于买入价格",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation: "在这种情况下，没有交易完成，所以最大利润为 0",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10⁵",
      "0 <= prices[i] <= 10⁴",
    ],
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
    id: 9,
    leetcodeNumber: 14,
    title: "最长公共前缀",
    difficulty: Difficulty.EASY,
    category: [Category.STRING],
    methods: [SolutionMethod.ITERATION],
    description: `编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 ""。`,
    examples: [
      {
        input: 'strs = ["flower","flow","flight"]',
        output: '"fl"',
      },
      {
        input: 'strs = ["dog","racecar","car"]',
        output: '""',
        explanation: "输入不存在公共前缀",
      },
    ],
    constraints: [
      "1 <= strs.length <= 200",
      "0 <= strs[i].length <= 200",
      "strs[i] 仅由小写英文字母组成",
    ],
    hints: [
      "先找到最短的字符串，公共前缀不会超过最短字符串的长度",
      "逐个字符比较所有字符串的对应位置",
      "一旦发现不匹配，返回之前的公共部分",
    ],
    solution: {
      methodName: "纵向扫描",
      methodDescription:
        "从第一个字符开始，逐个字符地比较所有字符串的对应位置。如果所有字符串在当前位置的字符都相同，继续下一个位置；否则返回当前已找到的公共前缀。",
      code: `function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return "";
  
  // 以第一个字符串为基准
  const first = strs[0];
  
  // 逐个字符比较
  for (let i = 0; i < first.length; i++) {
    const char = first[i];
    
    // 检查其他所有字符串的第 i 个字符
    for (let j = 1; j < strs.length; j++) {
      // 如果某个字符串长度不够，或字符不匹配
      if (i >= strs[j].length || strs[j][i] !== char) {
        return first.substring(0, i);
      }
    }
  }
  
  // 第一个字符串就是公共前缀
  return first;
}`,
      language: "typescript",
      keyLines: [8, 13, 14],
      steps: [
        "处理边界情况：如果数组为空，返回空字符串",
        "以第一个字符串为基准，逐个字符进行比较",
        "对于每个字符位置 i：",
        "  • 获取第一个字符串的第 i 个字符",
        "  • 遍历其他所有字符串：",
        "    - 如果某个字符串长度不够（i >= strs[j].length），返回前 i 个字符",
        "    - 如果字符不匹配（strs[j][i] !== char），返回前 i 个字符",
        "如果所有字符都匹配，返回第一个字符串",
      ],
      advantages: [
        "逻辑清晰：逐字符比较，易于理解",
        "提前终止：一旦发现不匹配立即返回",
        "空间效率高：只使用常数级别额外空间",
      ],
      timeComplexity: {
        value: "O(S)",
        description: "S 是所有字符串的字符数量总和。最坏情况下需要比较所有字符",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "横向扫描",
          description: "两两比较字符串找公共前缀",
          timeComplexity: "O(S)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["思路直观"],
          cons: ["需要多次字符串操作"],
        },
        {
          name: "纵向扫描",
          description: "逐字符比较所有字符串",
          timeComplexity: "O(S)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["提前终止", "逻辑清晰", "最优解"],
          cons: ["需要理解二层循环"],
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
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING, SolutionMethod.DIVIDE_CONQUER],
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
    constraints: [
      "1 <= nums.length <= 10⁵",
      "-10⁴ <= nums[i] <= 10⁴",
    ],
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
  // 后续添加更多题目...
];

export const getProblemById = (id: number): Problem | undefined => {
  return problems.find((p) => p.id === id);
};

export const getProblemsByCategory = (category: Category): Problem[] => {
  return problems.filter((p) => p.category.includes(category));
};

export const getProblemsByDifficulty = (difficulty: Difficulty): Problem[] => {
  return problems.filter((p) => p.difficulty === difficulty);
};

// 获取所有分类及其题目数量（题型分类）
export const getCategoryStats = () => {
  const stats = new Map<Category, number>();
  problems.forEach((problem) => {
    problem.category.forEach((cat) => {
      stats.set(cat, (stats.get(cat) || 0) + 1);
    });
  });
  return stats;
};

// 获取所有解决方式及其题目数量
export const getMethodStats = () => {
  const stats = new Map<SolutionMethod, number>();
  problems.forEach((problem) => {
    problem.methods.forEach((method) => {
      stats.set(method, (stats.get(method) || 0) + 1);
    });
  });
  return stats;
};

// 分类中文名称映射（题型）
export const categoryNames: Record<Category, string> = {
  [Category.ARRAY]: "数组",
  [Category.STRING]: "字符串",
  [Category.LINKED_LIST]: "链表",
  [Category.TREE]: "树",
  [Category.GRAPH]: "图",
  [Category.HASH_TABLE]: "哈希表",
  [Category.STACK]: "栈",
  [Category.QUEUE]: "队列",
  [Category.HEAP]: "堆",
  [Category.MATH]: "数学",
  [Category.MATRIX]: "矩阵",
};

// 解决方式中文名称映射
export const methodNames: Record<SolutionMethod, string> = {
  [SolutionMethod.DYNAMIC_PROGRAMMING]: "动态规划",
  [SolutionMethod.GREEDY]: "贪心算法",
  [SolutionMethod.BACKTRACKING]: "回溯",
  [SolutionMethod.BINARY_SEARCH]: "二分查找",
  [SolutionMethod.TWO_POINTERS]: "双指针",
  [SolutionMethod.SLIDING_WINDOW]: "滑动窗口",
  [SolutionMethod.DIVIDE_CONQUER]: "分治",
  [SolutionMethod.SORTING]: "排序",
  [SolutionMethod.BIT_MANIPULATION]: "位运算",
  [SolutionMethod.DFS]: "深度优先搜索",
  [SolutionMethod.BFS]: "广度优先搜索",
  [SolutionMethod.RECURSION]: "递归",
  [SolutionMethod.ITERATION]: "迭代",
};
