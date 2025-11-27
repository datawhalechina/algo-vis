import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 回溯类题目数据
 * 包含：组合总和、全排列、全排列II、子集、电话号码的字母组合、括号生成、单词搜索、分割回文串
 */
export const backtrackingProblems: Problem[] = [
  // Problem 36: 组合总和
  {
    id: 36,
    leetcodeNumber: 39,
    title: "组合总和",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BACKTRACKING],
    description: `给定一个无重复元素的数组 candidates 和一个目标数 target，找出 candidates 中所有可以使数字和为 target 的组合。candidates 中的数字可以无限制重复被选取。`,
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]" },
      { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]" },
    ],
    constraints: ["1 <= candidates.length <= 30", "所有 candidates 中的元素互不相同"],
    hints: ["使用回溯", "剪枝优化"],
    solution: {
      methodName: "回溯法",
      methodDescription: "使用回溯法枚举所有可能的组合，每个数字可以重复使用，当和等于目标值时记录组合。",
      code: `function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  function backtrack(start: number, path: number[], sum: number) {
    if (sum === target) { result.push([...path]); return; }
    if (sum > target) return;
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, sum + candidates[i]);
      path.pop();
    }
  }
  backtrack(0, [], 0);
  return result;
}`,
      language: "typescript",
      keyLines: [3, 4, 6],
      steps: [
        "从起始索引开始遍历候选数组",
        "将当前数字加入路径，更新和",
        "如果和等于目标值，记录当前组合",
        "如果和大于目标值，剪枝返回",
        "递归处理（注意：可以重复使用当前数字，所以传入i而不是i+1）",
        "回溯，移除最后添加的数字",
      ],
      advantages: [
        "完整性：能找到所有可行的组合",
        "剪枝优化：和超过目标值时立即返回",
        "允许重复：同一数字可以使用多次",
      ],
      timeComplexity: { value: "O(S)", description: "S为所有可行解的长度之和" },
      spaceComplexity: { value: "O(target)", description: "递归调用栈的深度" },
      comparisons: [],
    },
  },
  // Problem 39: 全排列
  {
    id: 39,
    leetcodeNumber: 46,
    title: "全排列",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BACKTRACKING],
    description: `给定一个不含重复数字的数组 nums，返回其所有可能的全排列。你可以按任意顺序返回答案。`,
    examples: [
      { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
      { input: "nums = [0,1]", output: "[[0,1],[1,0]]" },
    ],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10"],
    hints: ["回溯法", "标记已使用元素"],
    solution: {
      methodName: "回溯法",
      methodDescription: "使用回溯法逐个选择数字，标记已使用的元素，递归生成所有排列组合。",
      code: `function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  function backtrack(path: number[], used: boolean[]) {
    if (path.length === nums.length) { result.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      path.push(nums[i]);
      used[i] = true;
      backtrack(path, used);
      path.pop();
      used[i] = false;
    }
  }
  backtrack([], Array(nums.length).fill(false));
  return result;
}`,
      language: "typescript",
      keyLines: [4, 7, 8, 10, 11],
      steps: [
        "创建used数组标记每个数字的使用状态",
        "遍历所有数字，跳过已使用的",
        "将当前数字加入路径，标记为已使用",
        "递归处理剩余数字",
        "当路径长度等于数组长度时，记录一个完整排列",
        "回溯：移除最后添加的数字，取消使用标记",
      ],
      advantages: [
        "完整性：能生成所有n!个排列",
        "清晰性：使用used数组明确标记状态",
        "高效性：通过标记避免重复选择",
      ],
      timeComplexity: { value: "O(n!)", description: "n个数的全排列，共n!个" },
      spaceComplexity: { value: "O(n)", description: "递归调用栈和used数组的空间" },
      comparisons: [],
    },
  },
  // Problem 40: 全排列 II
  {
    id: 40,
    leetcodeNumber: 47,
    title: "全排列 II",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BACKTRACKING],
    description: `给定一个可包含重复数字的序列 nums，按任意顺序返回所有不重复的全排列。`,
    examples: [
      { input: "nums = [1,1,2]", output: "[[1,1,2],[1,2,1],[2,1,1]]" },
      { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
    ],
    constraints: ["1 <= nums.length <= 8", "-10 <= nums[i] <= 10"],
    hints: ["先排序", "跳过重复元素"],
    solution: {
      methodName: "回溯法 + 剪枝去重",
      methodDescription: "先对数组排序，然后在回溯过程中跳过重复元素（当前元素与前一个相同且前一个未使用时跳过），避免生成重复的排列。",
      code: `function permuteUnique(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];
  function backtrack(path: number[], used: boolean[]) {
    if (path.length === nums.length) { result.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      path.push(nums[i]);
      used[i] = true;
      backtrack(path, used);
      path.pop();
      used[i] = false;
    }
  }
  backtrack([], Array(nums.length).fill(false));
  return result;
}`,
      language: "typescript",
      keyLines: [2, 8],
      steps: [
        "首先对数组排序，使相同元素相邻",
        "创建used数组标记使用状态",
        "遍历数组选择元素",
        "跳过已使用的元素",
        "关键剪枝：如果当前元素与前一个相同，且前一个未使用，则跳过（避免重复）",
        "将元素加入路径并标记",
        "递归生成剩余部分",
        "回溯：移除元素并取消标记",
      ],
      advantages: [
        "去重性：通过剪枝避免生成重复排列",
        "完整性：仍能生成所有不重复的排列",
        "高效性：排序后的剪枝减少不必要的搜索",
      ],
      timeComplexity: { value: "O(n × n!)", description: "排序O(nlogn)，最多n!个排列，每个O(n)复制" },
      spaceComplexity: { value: "O(n)", description: "递归调用栈和used数组的空间" },
      comparisons: [],
    },
  },
  {
    id: 89,
    leetcodeNumber: 78,
    title: "子集",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY],
    methods: [SolutionMethod.BACKTRACKING],
    description: `给你一个整数数组 nums，数组中的元素互不相同。返回该数组所有可能的子集（幂集）。

解集不能包含重复的子集。你可以按任意顺序返回解集。`,
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
      },
      {
        input: "nums = [0]",
        output: "[[],[0]]",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10",
      "nums 中的所有元素互不相同",
    ],
    hints: [
      "使用回溯法，对每个元素有选或不选两种选择",
      "可以通过起始索引避免重复",
    ],
    solution: {
      methodName: "回溯法",
      methodDescription: "通过递归的方式，对每个元素做出选择或不选择的决定，生成所有可能的子集。",
      steps: [
        "从空集开始，每次选择一个元素加入当前子集",
        "递归处理剩余元素",
        "回溯时移除最后添加的元素",
        "记录每个完整路径作为一个子集",
      ],
      advantages: [
        "思路清晰：每个元素只有选或不选两种选择",
        "完整性：能生成所有可能的子集",
        "易于理解：递归结构直观",
      ],
      timeComplexity: {
        value: "O(2^n)",
        description: "共有 2^n 个子集，每个子集需要 O(n) 时间复制",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "递归栈的深度最多为 n",
      },
    },
  },
  {
    id: 90,
    leetcodeNumber: 17,
    title: "电话号码的字母组合",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.BACKTRACKING],
    description: `给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。答案可以按任意顺序返回。

给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。

2: abc
3: def
4: ghi
5: jkl
6: mno
7: pqrs
8: tuv
9: wxyz`,
    examples: [
      {
        input: 'digits = "23"',
        output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]',
      },
      {
        input: 'digits = ""',
        output: "[]",
      },
      {
        input: 'digits = "2"',
        output: '["a","b","c"]',
      },
    ],
    constraints: [
      "0 <= digits.length <= 4",
      "digits[i] 是范围 ['2', '9'] 的一个数字",
    ],
    hints: [
      "使用回溯法，逐个选择每个数字对应的字母",
      "可以用哈希表或数组存储数字到字母的映射",
    ],
    solution: {
      methodName: "回溯法",
      methodDescription: "对每个数字对应的字母进行递归选择，生成所有可能的字母组合。",
      steps: [
        "建立数字到字母的映射表",
        "从第一个数字开始，尝试它对应的每个字母",
        "递归处理下一个数字",
        "当处理完所有数字时，记录当前组合",
        "回溯并尝试其他字母",
      ],
      advantages: [
        "系统性：能生成所有可能的组合",
        "灵活性：容易扩展到其他映射规则",
        "直观性：递归结构清晰",
      ],
      timeComplexity: {
        value: "O(4^n)",
        description: "n 是数字长度，每个数字最多对应 4 个字母",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "递归调用栈的深度",
      },
    },
  },
  {
    id: 91,
    leetcodeNumber: 22,
    title: "括号生成",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.BACKTRACKING],
    description: `数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且有效的括号组合。`,
    examples: [
      {
        input: "n = 3",
        output: '["((()))","(()())","(())()","()(())","()()()"]',
      },
      {
        input: "n = 1",
        output: '["()"]',
      },
    ],
    constraints: ["1 <= n <= 8"],
    hints: [
      "使用回溯法，确保左括号数量不超过 n",
      "右括号数量不能超过左括号数量",
      "利用卡特兰数的性质",
    ],
    solution: {
      methodName: "回溯法",
      methodDescription: "通过回溯法生成所有有效的括号组合，关键是维护左右括号的数量约束。",
      steps: [
        "维护当前已使用的左括号和右括号数量",
        "如果左括号数量 < n，可以添加左括号",
        "如果右括号数量 < 左括号数量，可以添加右括号",
        "当路径长度达到 2*n 时，记录一个有效组合",
        "回溯并尝试其他可能",
      ],
      advantages: [
        "剪枝优化：通过约束条件避免生成无效括号",
        "完整性：能生成所有有效组合",
        "高效性：只生成有效组合，不浪费时间",
      ],
      timeComplexity: {
        value: "O(4^n / √n)",
        description: "第 n 个卡特兰数的时间复杂度",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "递归调用栈的深度",
      },
    },
  },
  {
    id: 92,
    leetcodeNumber: 79,
    title: "单词搜索",
    difficulty: Difficulty.MEDIUM,
    category: [Category.ARRAY, Category.MATRIX],
    methods: [SolutionMethod.BACKTRACKING, SolutionMethod.DFS],
    description: `给定一个 m x n 二维字符网格 board 和一个字符串单词 word。如果 word 存在于网格中，返回 true；否则，返回 false。

单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中"相邻"单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。`,
    examples: [
      {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
        output: "true",
      },
      {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"',
        output: "true",
      },
      {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"',
        output: "false",
      },
    ],
    constraints: [
      "m == board.length",
      "n = board[i].length",
      "1 <= m, n <= 6",
      "1 <= word.length <= 15",
      "board 和 word 仅由大小写英文字母组成",
    ],
    hints: [
      "使用 DFS + 回溯在网格中搜索",
      "需要标记已访问的单元格，回溯时取消标记",
      "从匹配首字母的位置开始搜索",
    ],
    solution: {
      methodName: "DFS + 回溯",
      methodDescription: "在二维网格中使用深度优先搜索和回溯法查找单词路径。",
      steps: [
        "遍历网格，找到与单词首字母匹配的起点",
        "从起点开始 DFS，尝试四个方向",
        "标记当前位置为已访问",
        "如果当前字符匹配，继续搜索下一个字符",
        "如果找到完整单词，返回 true",
        "回溯时取消访问标记",
      ],
      advantages: [
        "系统性：能遍历所有可能的路径",
        "空间优化：使用原地标记，不需要额外的访问数组",
        "剪枝：一旦字符不匹配立即返回",
      ],
      timeComplexity: {
        value: "O(m*n*4^L)",
        description: "m*n 是网格大小，L 是单词长度，每个位置最多 4 个方向",
      },
      spaceComplexity: {
        value: "O(L)",
        description: "递归调用栈的深度为单词长度",
      },
    },
  },
  {
    id: 93,
    leetcodeNumber: 131,
    title: "分割回文串",
    difficulty: Difficulty.MEDIUM,
    category: [Category.STRING],
    methods: [SolutionMethod.BACKTRACKING, SolutionMethod.DYNAMIC_PROGRAMMING],
    description: `给你一个字符串 s，请你将 s 分割成一些子串，使每个子串都是回文串。返回 s 所有可能的分割方案。

回文串是正着读和反着读都一样的字符串。`,
    examples: [
      {
        input: 's = "aab"',
        output: '[["a","a","b"],["aa","b"]]',
      },
      {
        input: 's = "a"',
        output: '[["a"]]',
      },
    ],
    constraints: [
      "1 <= s.length <= 16",
      "s 仅由小写英文字母组成",
    ],
    hints: [
      "使用回溯法枚举所有可能的分割方式",
      "对每个子串进行回文检查",
      "可以用动态规划预处理回文信息来优化",
    ],
    solution: {
      methodName: "回溯法 + 回文检查",
      methodDescription: "通过回溯法枚举所有可能的分割点，并检查每个子串是否为回文串。",
      steps: [
        "从字符串起始位置开始遍历",
        "尝试所有可能的分割点",
        "检查当前子串是否为回文",
        "如果是回文，将其加入路径，继续递归处理剩余部分",
        "如果处理完整个字符串，记录当前分割方案",
        "回溯，尝试其他分割方式",
      ],
      advantages: [
        "完整性：能找到所有有效的分割方案",
        "灵活性：容易添加额外约束",
        "可优化：可以预处理回文信息提升效率",
      ],
      timeComplexity: {
        value: "O(n * 2^n)",
        description: "n 是字符串长度，共有 2^n 种分割方式，每种需要 O(n) 检查",
      },
      spaceComplexity: {
        value: "O(n)",
        description: "递归调用栈和路径存储的空间",
      },
    },
  },
];
