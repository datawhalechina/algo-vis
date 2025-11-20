import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 数学类题目数据
 */
export const mathProblems: Problem[] = [
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
    id: 11,
    leetcodeNumber: 9,
    title: "回文数",
    difficulty: Difficulty.EASY,
    category: [Category.MATH],
    methods: [SolutionMethod.ITERATION],
    description: `给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。

回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。`,
    examples: [
      {
        input: "x = 121",
        output: "true",
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "从左向右读为 -121 。从右向左读为 121- 。因此它不是一个回文数。",
      },
      {
        input: "x = 10",
        output: "false",
        explanation: "从右向左读为 01 。因此它不是一个回文数。",
      },
    ],
    constraints: ["-2³¹ <= x <= 2³¹ - 1"],
    hints: [
      "负数不是回文数",
      "可以反转数字的一半来判断",
      "不需要将整个数字反转",
    ],
    solution: {
      methodName: "反转一半数字",
      methodDescription:
        "通过反转数字的后半部分，然后与前半部分比较。这样可以避免整数溢出的问题。",
      code: `function isPalindrome(x: number): boolean {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  
  let reversed = 0;
  while (x > reversed) {
    reversed = reversed * 10 + x % 10;
    x = Math.floor(x / 10);
  }
  
  return x === reversed || x === Math.floor(reversed / 10);
}`,
      language: "typescript",
      keyLines: [2, 5, 6, 9],
      steps: [
        "处理特殊情况：负数和末尾为0的非零数不是回文",
        "反转数字的后半部分",
        "  • 取出末位数字加到反转数中",
        "  • 去掉原数字的末位",
        "比较前半部分和反转的后半部分是否相等",
      ],
      advantages: [
        "避免溢出：只反转一半，不会超出整数范围",
        "时间优化：只需遍历一半的位数",
        "空间节省：O(1) 空间复杂度",
      ],
      timeComplexity: {
        value: "O(log n)",
        description: "只需遍历数字位数的一半",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "转字符串",
          description: "将数字转为字符串，比较正反序",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["实现简单"],
          cons: ["额外空间开销", "转换开销"],
        },
        {
          name: "反转一半数字",
          description: "数学方法反转后半部分数字",
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "无额外空间"],
          cons: ["需要理解数学技巧"],
        },
      ],
    },
  },
  {
    id: 23,
    leetcodeNumber: 136,
    title: "只出现一次的数字",
    difficulty: Difficulty.EASY,
    category: [Category.MATH],
    methods: [SolutionMethod.BIT_MANIPULATION],
    description: `给你一个 非空 整数数组 nums ，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。`,
    examples: [
      {
        input: "nums = [2,2,1]",
        output: "1",
      },
      {
        input: "nums = [4,1,2,1,2]",
        output: "4",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
    ],
    constraints: [
      "1 <= nums.length <= 3 * 10⁴",
      "-3 * 10⁴ <= nums[i] <= 3 * 10⁴",
      "除了某个元素只出现一次以外，其余每个元素均出现两次",
    ],
    hints: [
      "使用位运算XOR可以解决",
      "任何数和自己异或结果为0",
      "任何数和0异或结果为其本身",
    ],
    solution: {
      methodName: "位运算（异或）",
      methodDescription:
        "利用异或运算的特性：a ⊕ a = 0，a ⊕ 0 = a。将所有数字进行异或，成对的数字会互相抵消为0，最后剩下的就是只出现一次的数字。",
      code: `function singleNumber(nums: number[]): number {
  let result = 0;
  
  for (const num of nums) {
    result ^= num;
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [2, 4, 5],
      steps: [
        "初始化 result = 0",
        "遍历数组中的每个数字",
        "  • 将当前数字与 result 进行异或运算",
        "返回 result（即只出现一次的数字）",
      ],
      advantages: [
        "时间最优：O(n) 时间复杂度",
        "空间最优：O(1) 空间复杂度",
        "巧妙利用位运算特性",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要遍历数组一次",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了一个变量",
      },
      comparisons: [
        {
          name: "哈希表",
          description: "使用哈希表记录每个数字出现的次数",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["直观易理解"],
          cons: ["需要额外空间"],
        },
        {
          name: "位运算（异或）",
          description: "利用XOR的数学特性",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "无额外空间"],
          cons: ["需要理解位运算"],
        },
      ],
    },
  },
  {
    id: 24,
    leetcodeNumber: 202,
    title: "快乐数",
    difficulty: Difficulty.EASY,
    category: [Category.MATH],
    methods: [SolutionMethod.ITERATION],
    description: `编写一个算法来判断一个数 n 是不是快乐数。

「快乐数」定义为：
- 对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和。
- 然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。
- 如果这个过程 结果为 1，那么这个数就是快乐数。

如果 n 是 快乐数 就返回 true ；不是，则返回 false 。`,
    examples: [
      {
        input: "n = 19",
        output: "true",
        explanation: `1² + 9² = 82
8² + 2² = 68
6² + 8² = 100
1² + 0² + 0² = 1`,
      },
      {
        input: "n = 2",
        output: "false",
      },
    ],
    constraints: ["1 <= n <= 2³¹ - 1"],
    hints: [
      "如果进入循环，说明不是快乐数",
      "使用哈希集合检测循环",
      "也可以使用快慢指针检测循环",
    ],
    solution: {
      methodName: "哈希集合检测循环",
      methodDescription:
        "使用哈希集合记录计算过程中出现的数字。如果出现重复数字，说明进入循环；如果变成1，说明是快乐数。",
      code: `function isHappy(n: number): boolean {
  const seen = new Set<number>();
  
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = getNext(n);
  }
  
  return n === 1;
}

function getNext(n: number): number {
  let sum = 0;
  while (n > 0) {
    const digit = n % 10;
    sum += digit * digit;
    n = Math.floor(n / 10);
  }
  return sum;
}`,
      language: "typescript",
      keyLines: [2, 4, 5, 6, 15, 16],
      steps: [
        "创建哈希集合记录出现过的数字",
        "循环直到 n = 1 或检测到循环",
        "  • 将当前数字加入集合",
        "  • 计算下一个数字（各位数字平方和）",
        "返回是否为 1",
      ],
      advantages: [
        "思路清晰：直接检测循环",
        "实现简单：使用Set数据结构",
        "效率较高：平均情况下很快得出结果",
      ],
      timeComplexity: {
        value: "O(log n)",
        description: "每次迭代数字位数减少",
      },
      spaceComplexity: {
        value: "O(log n)",
        description: "存储出现过的数字",
      },
      comparisons: [
        {
          name: "哈希集合",
          description: "使用Set检测循环",
          timeComplexity: "O(log n)",
          spaceComplexity: "O(log n)",
          isRecommended: true,
          pros: ["直观易懂", "实现简单"],
          cons: ["需要额外空间"],
        },
        {
          name: "快慢指针",
          description: "类似链表环检测",
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["空间复杂度O(1)"],
          cons: ["实现复杂", "不够直观"],
        },
      ],
    },
  },
  {
    id: 25,
    leetcodeNumber: 204,
    title: "计数质数",
    difficulty: Difficulty.MEDIUM,
    category: [Category.MATH],
    methods: [SolutionMethod.ITERATION],
    description: `给定整数 n ，返回 所有小于非负整数 n 的质数的数量 。`,
    examples: [
      {
        input: "n = 10",
        output: "4",
        explanation: "小于 10 的质数一共有 4 个, 它们是 2, 3, 5, 7 。",
      },
      {
        input: "n = 0",
        output: "0",
      },
      {
        input: "n = 1",
        output: "0",
      },
    ],
    constraints: ["0 <= n <= 5 * 10⁶"],
    hints: [
      "使用埃拉托斯特尼筛法",
      "从最小的质数开始，标记其所有倍数为合数",
      "只需要检查到√n",
    ],
    solution: {
      methodName: "埃拉托斯特尼筛法",
      methodDescription:
        "从2开始，将每个质数的倍数都标记为合数。最后统计未被标记的数字个数。优化：只需要从i²开始标记，并且只检查到√n。",
      code: `function countPrimes(n: number): number {
  if (n <= 2) return 0;
  
  const isPrime = new Array(n).fill(true);
  isPrime[0] = isPrime[1] = false;
  
  for (let i = 2; i * i < n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j < n; j += i) {
        isPrime[j] = false;
      }
    }
  }
  
  return isPrime.filter(p => p).length;
}`,
      language: "typescript",
      keyLines: [4, 5, 7, 8, 9, 10],
      steps: [
        "处理边界：n ≤ 2 时返回 0",
        "创建布尔数组，初始假设所有数都是质数",
        "将 0 和 1 标记为非质数",
        "从 2 遍历到 √n",
        "  • 如果 i 是质数",
        "  • 从 i² 开始，标记 i 的所有倍数为合数",
        "统计质数个数",
      ],
      advantages: [
        "经典算法：埃拉托斯特尼筛法",
        "效率高：适合大范围筛选质数",
        "优化充分：从i²开始，只检查到√n",
      ],
      timeComplexity: {
        value: "O(n log log n)",
        description: "筛法的时间复杂度",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "需要n大小的布尔数组",
      },
      comparisons: [
        {
          name: "暴力法",
          description: "对每个数判断是否为质数",
          timeComplexity: "O(n√n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["简单直接"],
          cons: ["效率极低"],
        },
        {
          name: "埃拉托斯特尼筛法",
          description: "批量筛选质数",
          timeComplexity: "O(n log log n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["经典高效", "最优解法"],
          cons: ["需要额外空间"],
        },
      ],
    },
  },
  {
    id: 29,
    leetcodeNumber: 326,
    title: "3 的幂",
    difficulty: Difficulty.EASY,
    category: [Category.MATH],
    methods: [SolutionMethod.ITERATION, SolutionMethod.RECURSION],
    description: `给定一个整数，写一个函数来判断它是否是 3 的幂次方。如果是，返回 true ；否则，返回 false 。

整数 n 是 3 的幂次方需满足：存在整数 x 使得 n == 3ˣ 。`,
    examples: [
      {
        input: "n = 27",
        output: "true",
        explanation: "27 = 3³",
      },
      {
        input: "n = 0",
        output: "false",
        explanation: "不存在 x 使得 3ˣ = 0",
      },
      {
        input: "n = -1",
        output: "false",
        explanation: "不存在 x 使得 3ˣ = (-1)",
      },
    ],
    constraints: ["-2³¹ <= n <= 2³¹ - 1"],
    hints: [
      "循环除以3，看最后是否等于1",
      "可以用递归",
      "也可以用数学方法：log₃(n) 是否为整数",
    ],
    solution: {
      methodName: "循环除法",
      methodDescription:
        "如果n是3的幂，那么不断除以3最终会得到1。过程中如果出现不能整除的情况，说明不是3的幂。",
      code: `function isPowerOfThree(n: number): boolean {
  if (n <= 0) return false;
  
  while (n % 3 === 0) {
    n = n / 3;
  }
  
  return n === 1;
}`,
      language: "typescript",
      keyLines: [2, 4, 5, 8],
      steps: [
        "处理特殊情况：n ≤ 0 返回 false",
        "循环：当 n 能被 3 整除时",
        "  • n = n / 3",
        "检查最终 n 是否等于 1",
      ],
      advantages: [
        "思路简单：直接模拟",
        "易于理解：符合直觉",
        "无精度问题：避免浮点运算",
      ],
      timeComplexity: {
        value: "O(log n)",
        description: "除法次数等于log₃(n)",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用常数空间",
      },
      comparisons: [
        {
          name: "循环除法",
          description: "不断除以3直到不能整除",
          timeComplexity: "O(log n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["简单直观", "无精度问题"],
          cons: ["需要循环"],
        },
        {
          name: "对数法",
          description: "检查log₃(n)是否为整数",
          timeComplexity: "O(1)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["时间O(1)"],
          cons: ["浮点精度问题"],
        },
      ],
    },
  },
  {
    id: 30,
    leetcodeNumber: 190,
    title: "颠倒二进制位",
    difficulty: Difficulty.EASY,
    category: [Category.MATH],
    methods: [SolutionMethod.BIT_MANIPULATION],
    description: `颠倒给定的 32 位无符号整数的二进制位。

提示：
- 请注意，在某些语言（如 Java）中，没有无符号整数类型。在这种情况下，输入和输出都将被指定为有符号整数类型，并且不应影响您的实现，因为无论整数是有符号的还是无符号的，其内部的二进制表示形式都是相同的。
- 在 Java 中，编译器使用二进制补码记法来表示有符号整数。`,
    examples: [
      {
        input: "n = 00000010100101000001111010011100",
        output: "964176192 (00111001011110000010100101000000)",
        explanation: "输入的二进制串 00000010100101000001111010011100 表示无符号整数 43261596，因此返回 964176192，其二进制表示形式为 00111001011110000010100101000000。",
      },
      {
        input: "n = 11111111111111111111111111111101",
        output: "3221225471 (10111111111111111111111111111111)",
      },
    ],
    constraints: ["输入是一个长度为 32 的二进制字符串"],
    hints: [
      "逐位处理，从右到左取位，从左到右放位",
      "使用位运算：取最低位，结果左移，原数右移",
      "重复32次",
    ],
    solution: {
      methodName: "位运算",
      methodDescription:
        "遍历32位，每次取出最低位，将结果左移并加上该位。通过位运算实现二进制位的颠倒。",
      code: `function reverseBits(n: number): number {
  let result = 0;
  
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n = n >>> 1;
  }
  
  return result >>> 0;
}`,
      language: "typescript",
      keyLines: [2, 4, 5, 6, 9],
      steps: [
        "初始化 result = 0",
        "循环32次（处理32位）",
        "  • result 左移一位",
        "  • 取 n 的最低位，添加到 result",
        "  • n 无符号右移一位",
        "返回 result（无符号）",
      ],
      advantages: [
        "位运算：高效处理二进制",
        "固定次数：恰好32次循环",
        "空间最优：O(1)空间",
      ],
      timeComplexity: {
        value: "O(1)",
        description: "固定32次循环",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用常数空间",
      },
      comparisons: [
        {
          name: "位运算",
          description: "逐位处理，左移右移",
          timeComplexity: "O(1)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "高效简洁"],
          cons: ["需要理解位运算"],
        },
        {
          name: "字符串反转",
          description: "转字符串反转再转回数字",
          timeComplexity: "O(1)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["直观"],
          cons: ["性能较差", "类型转换开销"],
        },
      ],
    },
  },
];
