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
];
