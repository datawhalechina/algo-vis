import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 栈类题目数据
 */
export const stackProblems: Problem[] = [
  // Problem 97: 最小栈
  {
    id: 97,
    leetcodeNumber: 155,
    title: "最小栈",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STACK],
    methods: [SolutionMethod.ITERATION],
    description: `设计一个支持 push，pop，top 操作，并能在常数时间内检索到最小元素的栈。

实现 MinStack 类:
- MinStack() 初始化堆栈对象。
- void push(int val) 将元素val推入堆栈。
- void pop() 删除堆栈顶部的元素。
- int top() 获取堆栈顶部的元素。
- int getMin() 获取堆栈中的最小元素。`,
    examples: [
      {
        input: `["MinStack","push","push","push","getMin","pop","top","getMin"]
[[],[-2],[0],[-3],[],[],[],[]]`,
        output: `[null,null,null,null,-3,null,0,-2]`,
      },
    ],
    constraints: [
      "-2³¹ <= val <= 2³¹ - 1",
      "pop、top 和 getMin 操作总是在非空栈上调用",
      "push, pop, top, and getMin 最多被调用 3 * 10⁴ 次",
    ],
    hints: ["使用辅助栈", "同步记录最小值"],
    solution: {
      methodName: "辅助栈",
      methodDescription: "使用一个辅助栈来同步记录当前栈中的最小值，每次push和pop时同步更新。",
      code: `class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];
  
  push(val: number): void {
    this.stack.push(val);
    if (this.minStack.length === 0 || val <= this.getMin()) {
      this.minStack.push(val);
    }
  }
  
  pop(): void {
    const val = this.stack.pop();
    if (val === this.getMin()) {
      this.minStack.pop();
    }
  }
  
  top(): number {
    return this.stack[this.stack.length - 1];
  }
  
  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}`,
      language: "typescript",
      keyLines: [7, 14, 24],
      steps: [
        "使用主栈存储所有元素",
        "使用辅助栈存储每个状态的最小值",
        "push时，如果新值小于等于当前最小值，也push到辅助栈",
        "pop时，如果弹出的是最小值，辅助栈也要pop",
        "getMin直接返回辅助栈的栈顶",
      ],
      advantages: [
        "所有操作都是O(1)时间",
        "空间复杂度O(n)",
        "实现简单优雅",
      ],
      timeComplexity: { value: "O(1)", description: "所有操作都是常数时间" },
      spaceComplexity: { value: "O(n)", description: "需要额外的辅助栈" },
      comparisons: [],
    },
  },
  // Problem 98: 每日温度
  {
    id: 98,
    leetcodeNumber: 739,
    title: "每日温度",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STACK, Category.ARRAY],
    methods: [SolutionMethod.STACK],
    description: `给定一个整数数组 temperatures，表示每天的温度，返回一个数组 answer，其中 answer[i] 是指对于第 i 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 0 来代替。`,
    examples: [
      { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
      { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" },
      { input: "temperatures = [30,60,90]", output: "[1,1,0]" },
    ],
    constraints: [
      "1 <= temperatures.length <= 10⁵",
      "30 <= temperatures[i] <= 100",
    ],
    hints: ["单调栈", "从右向左遍历"],
    solution: {
      methodName: "单调栈",
      methodDescription: "使用单调递减栈存储索引，当遇到更高温度时，栈中所有较低温度的索引都找到了答案。",
      code: `function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const answer = new Array(n).fill(0);
  const stack: number[] = []; // 存储索引
  
  for (let i = 0; i < n; i++) {
    // 当前温度大于栈顶索引对应的温度
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      answer[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  
  return answer;
}`,
      language: "typescript",
      keyLines: [8, 9, 10, 12],
      steps: [
        "创建结果数组，初始化为0",
        "使用栈存储还未找到答案的日期索引",
        "遍历温度数组",
        "当前温度大于栈顶索引对应的温度时，栈顶找到了答案",
        "计算天数差并更新结果",
        "当前索引入栈",
      ],
      advantages: [
        "时间复杂度O(n)，每个元素最多入栈出栈一次",
        "空间复杂度O(n)",
        "单调栈的经典应用",
      ],
      timeComplexity: { value: "O(n)", description: "遍历一遍数组，每个元素最多入栈出栈一次" },
      spaceComplexity: { value: "O(n)", description: "栈的空间" },
      comparisons: [],
    },
  },
  // Problem 99: 字符串解码
  {
    id: 99,
    leetcodeNumber: 394,
    title: "字符串解码",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STACK, Category.STRING],
    methods: [SolutionMethod.STACK],
    description: `给定一个经过编码的字符串，返回它解码后的字符串。

编码规则为: k[encoded_string]，表示其中方括号内部的 encoded_string 正好重复 k 次。注意 k 保证为正整数。

你可以认为输入字符串总是有效的；输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。

此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 k ，例如不会出现像 3a 或 2[4] 的输入。`,
    examples: [
      { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
      { input: 's = "3[a2[c]]"', output: '"accaccacc"' },
      { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"' },
      { input: 's = "abc3[cd]xyz"', output: '"abccdcdcdxyz"' },
    ],
    constraints: [
      "1 <= s.length <= 30",
      "s 由小写英文字母、数字和方括号 '[]' 组成",
      "s 保证是一个有效的输入",
      "s 中所有整数的取值范围为 [1, 300]",
    ],
    hints: ["使用两个栈", "一个存数字，一个存字符串", "遇到左括号压栈，右括号出栈"],
    solution: {
      methodName: "双栈法",
      methodDescription: "使用两个栈，一个存储重复次数，一个存储字符串。遇到 '[' 时入栈，遇到 ']' 时出栈并重复字符串。",
      code: `function decodeString(s: string): string {
  const numStack: number[] = [];
  const strStack: string[] = [];
  let num = 0;
  let result = "";
  
  for (const char of s) {
    if (char >= '0' && char <= '9') {
      num = num * 10 + parseInt(char);
    } else if (char === '[') {
      numStack.push(num);
      strStack.push(result);
      num = 0;
      result = "";
    } else if (char === ']') {
      const repeatTimes = numStack.pop()!;
      const prevStr = strStack.pop()!;
      result = prevStr + result.repeat(repeatTimes);
    } else {
      result += char;
    }
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [11, 12, 16, 18],
      steps: [
        "初始化数字栈、字符串栈、当前数字和当前结果字符串",
        "遍历字符串的每个字符",
        "如果是数字，累加到当前数字",
        "如果是'['，将当前数字和结果字符串压栈，重置状态",
        "如果是']'，弹出栈顶，重复当前字符串并拼接",
        "如果是字母，追加到当前结果",
        "返回最终结果",
      ],
      advantages: [
        "时间复杂度O(n)，n为解码后字符串的长度",
        "空间复杂度O(n)",
        "双栈法思路清晰，易于理解",
        "能处理嵌套的编码",
      ],
      timeComplexity: { value: "O(n)", description: "n为解码后字符串的长度，需要遍历原字符串" },
      spaceComplexity: { value: "O(n)", description: "需要两个栈存储中间状态" },
      comparisons: [],
    },
  },
  // Problem 119: 柱状图中最大的矩形
  {
    id: 119,
    leetcodeNumber: 84,
    title: "柱状图中最大的矩形",
    difficulty: Difficulty.HARD,
    category: [Category.ARRAY, Category.STACK],
    methods: [SolutionMethod.STACK],
    description: `给定 n 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1。

求在该柱状图中，能够勾勒出来的矩形的最大面积。`,
    examples: [
      { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "最大的矩形面积为 10" },
      { input: "heights = [2,4]", output: "4" },
    ],
    constraints: [
      "1 <= heights.length <= 10⁵",
      "0 <= heights[i] <= 10⁴",
    ],
    hints: ["单调栈", "维护递增栈", "计算以每个柱子为高的最大矩形"],
    solution: {
      methodName: "单调栈",
      methodDescription: "使用单调递增栈，当遇到较小的高度时，计算以栈顶高度为高的最大矩形面积。",
      code: `function largestRectangleArea(heights: number[]): number {
  const stack: number[] = [];
  let maxArea = 0;
  
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    
    while (stack.length > 0 && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()!];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    
    stack.push(i);
  }
  
  return maxArea;
}`,
      language: "typescript",
      keyLines: [4, 7, 8, 9],
      steps: [
        "使用单调递增栈存储索引",
        "遍历每个柱子（包括虚拟的末尾0）",
        "当遇到较小高度时，弹出栈顶并计算矩形面积",
        "宽度 = 当前索引 - 新栈顶索引 - 1",
        "更新最大面积",
      ],
      advantages: [
        "时间复杂度O(n)",
        "空间复杂度O(n)",
        "单调栈经典应用",
      ],
      timeComplexity: { value: "O(n)", description: "每个元素最多入栈出栈一次" },
      spaceComplexity: { value: "O(n)", description: "栈的空间" },
      comparisons: [],
    },
  },
];
