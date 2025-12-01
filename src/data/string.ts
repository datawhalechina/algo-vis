import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 字符串类题目数据
 */
export const stringProblems: Problem[] = [
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
    id: 20,
    leetcodeNumber: 344,
    title: "反转字符串",
    difficulty: Difficulty.EASY,
    category: [Category.STRING],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 s 的形式给出。

不要给另外的数组分配额外的空间，你必须原地修改输入数组、使用 O(1) 的额外空间解决这一问题。`,
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    constraints: ["1 <= s.length <= 10⁵", "s[i] 都是 ASCII 码表中的可打印字符"],
    hints: [
      "使用双指针，一个指向头，一个指向尾",
      "交换两个指针指向的字符，然后向中间移动",
    ],
    solution: {
      methodName: "双指针",
      methodDescription:
        "使用两个指针，一个从头开始，一个从尾开始，不断交换它们指向的字符，直到相遇。",
      code: `function reverseString(s: string[]): void {
  let left = 0;
  let right = s.length - 1;
  
  while (left < right) {
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    
    left++;
    right--;
  }
}`,
      language: "typescript",
      keyLines: [2, 3, 6, 7, 8, 10, 11],
      steps: [
        "初始化 left = 0, right = s.length - 1",
        "当 left < right 时循环：",
        "  • 交换 s[left] 和 s[right]",
        "  • left++, right--",
        "循环结束即完成反转",
      ],
      advantages: ["原地修改：不需要额外空间", "时间最优：O(n) 遍历一次"],
      timeComplexity: {
        value: "O(n)",
        description: "只需遍历数组的一半",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个变量",
      },
      comparisons: [
        {
          name: "双指针",
          description: "首尾交换",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "原地操作"],
          cons: ["无"],
        },
      ],
    },
  },
  {
    id: 26,
    leetcodeNumber: 205,
    title: "同构字符串",
    difficulty: Difficulty.EASY,
    category: [Category.STRING, Category.HASH_TABLE],
    methods: [SolutionMethod.ITERATION],
    description: `给定两个字符串 s 和 t ，判断它们是否是同构的。

如果 s 中的字符可以按某种映射关系替换得到 t ，那么这两个字符串是同构的。

每个出现的字符都应当映射到另一个字符，同时不改变字符的顺序。不同字符不能映射到同一个字符上，相同字符只能映射到同一个字符上，字符可以映射到自己本身。`,
    examples: [
      {
        input: 's = "egg", t = "add"',
        output: "true",
      },
      {
        input: 's = "foo", t = "bar"',
        output: "false",
      },
      {
        input: 's = "paper", t = "title"',
        output: "true",
      },
    ],
    constraints: [
      "1 <= s.length <= 5 * 10⁴",
      "t.length == s.length",
      "s 和 t 由任意有效的 ASCII 字符组成",
    ],
    hints: [
      "需要建立双向映射关系",
      "使用两个哈希表分别记录 s->t 和 t->s 的映射",
      "检查映射是否一致",
    ],
    solution: {
      methodName: "双向哈希表",
      methodDescription:
        "使用两个哈希表分别记录 s 到 t 和 t 到 s 的字符映射关系。遍历字符串，检查每个字符的映射是否一致。",
      code: `function isIsomorphic(s: string, t: string): boolean {
  const mapST = new Map<string, string>();
  const mapTS = new Map<string, string>();
  
  for (let i = 0; i < s.length; i++) {
    const charS = s[i];
    const charT = t[i];
    
    if (mapST.has(charS)) {
      if (mapST.get(charS) !== charT) return false;
    } else {
      mapST.set(charS, charT);
    }
    
    if (mapTS.has(charT)) {
      if (mapTS.get(charT) !== charS) return false;
    } else {
      mapTS.set(charT, charS);
    }
  }
  
  return true;
}`,
      language: "typescript",
      keyLines: [2, 3, 8, 9, 14, 15],
      steps: [
        "创建两个哈希表：mapST 和 mapTS",
        "遍历字符串的每个位置",
        "  • 检查 s[i] 的映射是否存在且一致",
        "  • 检查 t[i] 的映射是否存在且一致",
        "  • 如果不一致，返回 false",
        "  • 否则建立/更新映射关系",
        "全部检查通过，返回 true",
      ],
      advantages: [
        "完整性：双向检查避免遗漏",
        "效率高：O(n) 时间复杂度",
        "易理解：直观的映射关系",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "遍历字符串一次",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "字符集大小固定（ASCII 字符）",
      },
      comparisons: [
        {
          name: "双向哈希表",
          description: "两个Map分别记录双向映射",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["完整准确", "最优解法"],
          cons: ["需要维护两个Map"],
        },
        {
          name: "单向哈希表",
          description: "只记录一个方向的映射",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: false,
          pros: ["代码简单"],
          cons: ["可能漏判某些情况"],
        },
      ],
    },
  },
  // Problem 32: 最长有效括号
  {
    id: 32,
    leetcodeNumber: 32,
    title: "最长有效括号",
    difficulty: Difficulty.HARD,
    category: [Category.STRING, Category.STACK],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个只包含 '(' 和 ')' 的字符串，找出最长有效（格式正确且连续）括号子串的长度。`,
    examples: [
      { input: 's = "(()"', output: "2", explanation: "最长有效括号子串是 \"()\"" },
      { input: 's = ")()())"', output: "4", explanation: "最长有效括号子串是 \"()()\"" },
      { input: 's = ""', output: "0" },
    ],
    constraints: ["0 <= s.length <= 3 * 10⁴", "s[i] 为 '(' 或 ')'"],
    hints: ["使用栈存储索引", "栈底存储基准索引", "计算有效长度"],
    solution: {
      methodName: "栈",
      methodDescription: "使用栈存储索引，栈底存入-1作为基准，计算有效括号长度",
      code: `function longestValidParentheses(s: string): number {
  const stack: number[] = [-1];
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }
  return maxLen;
}`,
      language: "typescript",
      keyLines: [4, 5, 7, 11],
      steps: ["初始化栈，压入-1", "遇到'('压栈", "遇到')'弹栈并计算长度"],
      advantages: ["O(n)时间", "一次遍历"],
      timeComplexity: { value: "O(n)", description: "遍历字符串一次" },
      spaceComplexity: { value: "O(n)", description: "栈空间" },
      comparisons: [
        {
          name: "栈解法",
          description: "使用栈存储索引",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: true,
          pros: ["直观易懂", "实现简单"],
          cons: ["需要额外空间"],
        },
        {
          name: "动态规划",
          description: "dp[i]表示以i结尾的最长有效括号",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["空间可优化"],
          cons: ["状态转移复杂"],
        },
      ],
    },
  },
  // Problem 44: 无重复字符的最长子串
  {
    id: 44,
    leetcodeNumber: 3,
    title: "无重复字符的最长子串",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.SLIDING_WINDOW],
    description: `给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。`,
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: '因为无重复字符的最长子串是 "abc"，所以其长度为 3。',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: '因为无重复字符的最长子串是 "b"，所以其长度为 1。',
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        explanation: '因为无重复字符的最长子串是 "wke"，所以其长度为 3。',
      },
    ],
    constraints: ["0 <= s.length <= 5 * 10⁴", "s 由英文字母、数字、符号和空格组成"],
    hints: ["使用滑动窗口", "用哈希表记录字符位置", "遇到重复字符时移动左指针"],
    solution: {
      methodName: "滑动窗口",
      methodDescription: "使用滑动窗口和哈希表，记录字符最后出现的位置，动态调整窗口大小",
      code: `function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let left = 0;
  let maxLength = 0;
  
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    
    // 如果字符已存在且在窗口内，移动左指针
    if (map.has(char) && map.get(char)! >= left) {
      left = map.get(char)! + 1;
    }
    
    map.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  
  return maxLength;
}`,
      language: "typescript",
      keyLines: [9, 10, 13, 14],
      steps: ["初始化滑动窗口", "右指针遍历字符串", "检查字符是否重复", "更新左指针位置", "更新最大长度"],
      advantages: ["一次遍历", "动态窗口", "O(n)时间"],
      timeComplexity: { value: "O(n)", description: "遍历字符串一次" },
      spaceComplexity: { value: "O(min(m,n))", description: "m为字符集大小" },
      comparisons: [],
    },
  },
  // Problem 45: 找到字符串中所有字母异位词
  {
    id: 45,
    leetcodeNumber: 438,
    title: "找到字符串中所有字母异位词",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.SLIDING_WINDOW],
    description: `给定两个字符串 s 和 p，找到 s 中所有 p 的异位词的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

异位词指由相同字母重新排列形成的字符串（包括相同的字符串）。`,
    examples: [
      {
        input: 's = "cbaebabacd", p = "abc"',
        output: "[0,6]",
        explanation: '起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。',
      },
      {
        input: 's = "abab", p = "ab"',
        output: "[0,1,2]",
        explanation: '起始索引等于 0 的子串是 "ab", 它是 "ab" 的异位词。起始索引等于 1 的子串是 "ba", 它是 "ab" 的异位词。起始索引等于 2 的子串是 "ab", 它是 "ab" 的异位词。',
      },
    ],
    constraints: [
      "1 <= s.length, p.length <= 3 * 10⁴",
      "s 和 p 仅包含小写字母",
    ],
    hints: ["使用滑动窗口", "维护固定长度窗口", "比较窗口内字符频次"],
    solution: {
      methodName: "滑动窗口+字符计数",
      methodDescription: "维护长度为p.length的滑动窗口，比较窗口内字符频次是否与p相同",
      code: `function findAnagrams(s: string, p: string): number[] {
  const result: number[] = [];
  if (s.length < p.length) return result;
  
  const pCount = new Array(26).fill(0);
  const sCount = new Array(26).fill(0);
  
  // 统计p的字符频次
  for (const char of p) {
    pCount[char.charCodeAt(0) - 97]++;
  }
  
  // 初始化窗口
  for (let i = 0; i < p.length; i++) {
    sCount[s.charCodeAt(i) - 97]++;
  }
  
  // 比较函数
  const isAnagram = () => pCount.every((count, i) => count === sCount[i]);
  
  if (isAnagram()) result.push(0);
  
  // 滑动窗口
  for (let i = p.length; i < s.length; i++) {
    sCount[s.charCodeAt(i) - 97]++;
    sCount[s.charCodeAt(i - p.length) - 97]--;
    
    if (isAnagram()) {
      result.push(i - p.length + 1);
    }
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [19, 25, 26, 28],
      steps: ["统计p的字符频次", "初始化窗口", "滑动窗口移动", "移除左边字符", "添加右边字符", "比较频次"],
      advantages: ["固定窗口", "高效比较", "一次遍历"],
      timeComplexity: { value: "O(n)", description: "n为s的长度" },
      spaceComplexity: { value: "O(1)", description: "固定26个字母" },
      comparisons: [],
    },
  },
  // Problem 46: 和为K的子数组
  {
    id: 46,
    leetcodeNumber: 560,
    title: "和为 K 的子数组",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY, Category.HASH_TABLE],
    methods: [SolutionMethod.ITERATION],
    description: `给你一个整数数组 nums 和一个整数 k，请你统计并返回该数组中和为 k 的连续子数组的个数。

子数组是数组中元素的连续非空序列。`,
    examples: [
      { input: "nums = [1,1,1], k = 2", output: "2" },
      { input: "nums = [1,2,3], k = 3", output: "2" },
    ],
    constraints: [
      "1 <= nums.length <= 2 * 10⁴",
      "-1000 <= nums[i] <= 1000",
      "-10⁷ <= k <= 10⁷",
    ],
    hints: ["使用前缀和", "哈希表记录前缀和出现次数", "sum[i,j] = preSum[j] - preSum[i-1]"],
    solution: {
      methodName: "前缀和+哈希表",
      methodDescription: "用哈希表记录前缀和出现次数，如果preSum - k存在，说明有符合条件的子数组",
      code: `function subarraySum(nums: number[], k: number): number {
  const map = new Map<number, number>();
  map.set(0, 1); // 前缀和为0出现1次
  
  let preSum = 0;
  let count = 0;
  
  for (const num of nums) {
    preSum += num;
    
    // 如果 preSum - k 存在，说明有子数组和为k
    if (map.has(preSum - k)) {
      count += map.get(preSum - k)!;
    }
    
    // 记录当前前缀和
    map.set(preSum, (map.get(preSum) || 0) + 1);
  }
  
  return count;
}`,
      language: "typescript",
      keyLines: [2, 9, 12, 17],
      steps: ["初始化哈希表", "遍历计算前缀和", "查找preSum-k", "累加次数", "记录当前前缀和"],
      advantages: ["一次遍历", "空间换时间", "巧妙利用前缀和"],
      timeComplexity: { value: "O(n)", description: "遍历数组一次" },
      spaceComplexity: { value: "O(n)", description: "哈希表存储前缀和" },
      comparisons: [],
    },
  },
  // Problem 110: 划分字母区间
  {
    id: 110,
    leetcodeNumber: 763,
    title: "划分字母区间",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.GREEDY],
    description: `给你一个字符串 s。我们要把这个字符串划分为尽可能多的片段，同一字母最多出现在一个片段中。

注意，划分结果需要满足：将所有片段连接后，得到的字符串仍然是 s。

返回一个表示每个字符串片段的长度的列表。`,
    examples: [
      { input: 's = "ababcbacadefegdehijhklij"', output: "[9,7,8]", explanation: "划分结果为 \"ababcbaca\"、\"defegde\"、\"hijhklij\"。每个字母最多出现在一个片段中。" },
      { input: 's = "eccbbbbdec"', output: "[10]" },
    ],
    constraints: [
      "1 <= s.length <= 500",
      "s 仅由小写英文字母组成",
    ],
    hints: ["贪心", "记录每个字符最后出现的位置", "维护当前片段的右边界"],
    solution: {
      methodName: "贪心算法",
      methodDescription: "先记录每个字符最后出现的位置，然后遍历字符串，维护当前片段的右边界。当到达右边界时，完成一个片段。",
      code: `function partitionLabels(s: string): number[] {
  const lastIndex = new Map<string, number>();
  
  // 记录每个字符最后出现的位置
  for (let i = 0; i < s.length; i++) {
    lastIndex.set(s[i], i);
  }
  
  const result: number[] = [];
  let start = 0;
  let end = 0;
  
  for (let i = 0; i < s.length; i++) {
    // 更新当前片段的右边界
    end = Math.max(end, lastIndex.get(s[i])!);
    
    // 到达右边界，完成一个片段
    if (i === end) {
      result.push(end - start + 1);
      start = end + 1;
    }
  }
  
  return result;
}`,
      language: "typescript",
      keyLines: [4, 13, 16],
      steps: [
        "记录每个字符最后出现的位置",
        "遍历字符串，维护当前片段的右边界end",
        "当i === end时，完成一个片段",
        "更新start为下一个片段的起始位置",
        "返回所有片段的长度",
      ],
      advantages: [
        "时间复杂度O(n)",
        "空间复杂度O(1)（字符集大小固定）",
        "贪心策略最优",
      ],
      timeComplexity: { value: "O(n)", description: "遍历字符串两次" },
      spaceComplexity: { value: "O(1)", description: "字符集大小固定为26" },
      comparisons: [],
    },
  },
  // Problem 114: 最长回文子串
  {
    id: 114,
    leetcodeNumber: 5,
    title: "最长回文子串",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个字符串 s，找到 s 中最长的回文子串。

如果字符串的反序与原始字符串相同，则该字符串称为回文字符串。`,
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" 同样是符合题意的答案。' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    constraints: [
      "1 <= s.length <= 1000",
      "s 仅由数字和英文字母组成",
    ],
    hints: ["动态规划", "中心扩展", "dp[i][j]表示s[i...j]是否为回文"],
    solution: {
      methodName: "中心扩展法",
      methodDescription: "对于每个可能的中心位置，向两边扩展寻找最长的回文子串。需要考虑奇数和偶数长度的回文。",
      code: `function longestPalindrome(s: string): string {
  let start = 0;
  let maxLen = 1;
  
  function expandAroundCenter(left: number, right: number): void {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const len = right - left + 1;
      if (len > maxLen) {
        maxLen = len;
        start = left;
      }
      left--;
      right++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);      // 奇数长度
    expandAroundCenter(i, i + 1);  // 偶数长度
  }
  
  return s.substring(start, start + maxLen);
}`,
      language: "typescript",
      keyLines: [4, 15, 16],
      steps: [
        "遍历每个可能的中心位置",
        "对于每个中心，向两边扩展",
        "检查是否为回文，更新最长回文",
        "考虑奇数和偶数长度的回文",
        "返回最长回文子串",
      ],
      advantages: [
        "时间复杂度O(n²)",
        "空间复杂度O(1)",
        "中心扩展法直观高效",
      ],
      timeComplexity: { value: "O(n²)", description: "n为字符串长度，每个中心最多扩展n次" },
      spaceComplexity: { value: "O(1)", description: "只使用常数空间" },
      comparisons: [],
    },
  },
];
