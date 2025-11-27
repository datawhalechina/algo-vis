import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 栈类题目数据
 */
export const stackProblems: Problem[] = [
  // Problem 96: 有效的括号
  {
    id: 96,
    leetcodeNumber: 20,
    title: "有效的括号",
    difficulty: Difficulty.EASY,
    category: [Category.STACK, Category.STRING],
    methods: [SolutionMethod.ITERATION],
    description: `给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s，判断字符串是否有效。

有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
      { input: 's = "([)]"', output: "false" },
      { input: 's = "{[]}"', output: "true" },
    ],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s 仅由括号 '()[]{}' 组成",
    ],
    hints: ["使用栈", "左括号入栈，右括号匹配出栈"],
    solution: {
      methodName: "栈",
      methodDescription: "使用栈来匹配括号，遇到左括号入栈，遇到右括号则与栈顶元素匹配。",
      code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (const char of s) {
    if (char in map) {
      // 右括号
      if (stack.length === 0 || stack.pop() !== map[char]) {
        return false;
      }
    } else {
      // 左括号
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
      language: "typescript",
      keyLines: [10, 12, 17, 21],
      steps: [
        "创建栈和括号映射表",
        "遍历字符串的每个字符",
        "如果是左括号，入栈",
        "如果是右括号，检查栈是否为空，以及栈顶是否匹配",
        "遍历结束后，栈应该为空",
      ],
      advantages: [
        "时间复杂度O(n)",
        "空间复杂度O(n)",
        "逻辑清晰简单",
      ],
      timeComplexity: { value: "O(n)", description: "遍历一遍字符串" },
      spaceComplexity: { value: "O(n)", description: "栈的空间" },
      comparisons: [],
    },
  },
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
];
