import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 图类题目数据
 */
export const graphProblems: Problem[] = [
  {
    id: 22,
    leetcodeNumber: 200,
    title: "岛屿数量",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.DFS, SolutionMethod.BFS],
    description: `给你一个由 '1'（陆地）和 '0'（水域）组成的的二维网格，请你计算网格中岛屿的数量。

一个岛屿被水包围，并且它是通过水平方向或垂直方向上相邻的陆地连接而成的。你可以假设网格的四个边均被水包围。`,
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: "1",
        explanation: "网格中有一个岛屿",
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: "3",
        explanation: "网格中有三个岛屿",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] 的值为 '0' 或 '1'",
    ],
    hints: [
      "使用DFS或BFS遍历每个岛屿",
      "遍历过的陆地需要标记，避免重复计算",
      "每次发现新的陆地时，岛屿数量加1",
    ],
    solution: {
      methodName: "深度优先搜索（DFS）",
      methodDescription:
        "遍历网格，每当遇到未访问的陆地时，使用DFS标记整个岛屿，并将岛屿数量加1。",
      code: `function numIslands(grid: string[][]): number {
  if (!grid || grid.length === 0) return 0;
  
  const rows = grid.length;
  const cols = grid[0].length;
  let islandCount = 0;
  
  function dfs(row: number, col: number) {
    if (row < 0 || row >= rows || col < 0 || col >= cols 
        || grid[row][col] === '0') {
      return;
    }
    
    grid[row][col] = '0'; // 标记为已访问
    
    // 四个方向DFS
    dfs(row - 1, col);
    dfs(row + 1, col);
    dfs(row, col - 1);
    dfs(row, col + 1);
  }
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === '1') {
        islandCount++;
        dfs(i, j);
      }
    }
  }
  
  return islandCount;
}`,
      language: "typescript",
      keyLines: [5, 12, 20, 22],
      steps: [
        "遍历网格中的每个单元格",
        "如果遇到未访问的陆地（'1'），岛屿数量加1",
        "使用DFS标记整个岛屿（将相邻的陆地都标记为已访问）",
        "DFS时检查四个方向（上、下、左、右）",
        "继续遍历，直到所有单元格都被访问",
      ],
      advantages: [
        "思路清晰：直接模拟问题场景",
        "代码简洁：递归实现非常直观",
        "效率高：每个单元格只访问一次",
      ],
      timeComplexity: {
        value: "O(m × n)",
        description: "需要遍历网格中的每个单元格，每个单元格最多访问一次",
      },
      spaceComplexity: {
        value: "O(m × n)",
        description:
          "递归调用栈的深度在最坏情况下等于网格中所有陆地单元格的数量",
      },
      comparisons: [
        {
          name: "DFS（递归）",
          description: "使用深度优先搜索递归标记岛屿",
          timeComplexity: "O(m × n)",
          spaceComplexity: "O(m × n)",
          isRecommended: true,
          pros: ["代码简洁", "思路清晰"],
          cons: ["递归栈可能较深"],
        },
        {
          name: "BFS（迭代）",
          description: "使用广度优先搜索和队列标记岛屿",
          timeComplexity: "O(m × n)",
          spaceComplexity: "O(min(m, n))",
          isRecommended: false,
          pros: ["队列空间通常小于递归栈"],
          cons: ["代码相对复杂"],
        },
      ],
    },
  },
  // Problem 86: 腐烂的橘子
  {
    id: 86,
    leetcodeNumber: 994,
    title: "腐烂的橘子",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH, Category.MATRIX],
    methods: [SolutionMethod.BFS],
    description: `在给定的 m x n 网格 grid 中，每个单元格可以有以下三个值之一：

- 值 0 代表空单元格
- 值 1 代表新鲜橘子
- 值 2 代表腐烂的橘子

每分钟，腐烂的橘子周围 4 个方向上相邻的新鲜橘子都会腐烂。

返回 直到单元格中没有新鲜橘子为止所必须经过的最小分钟数。如果不可能，返回 -1 。`,
    examples: [
      {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        output: "4",
      },
      {
        input: "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        output: "-1",
        explanation: "左下角的橘子（第 2 行，第 0 列）永远不会腐烂，因为腐烂只会发生在 4 个方向上",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 10",
      "grid[i][j] 仅为 0、1 或 2",
    ],
    hints: [
      "使用多源BFS",
      "将所有初始腐烂的橘子加入队列",
      "每次扩散一层，时间+1",
      "最后检查是否还有新鲜橘子",
    ],
    solution: {
      methodName: "多源BFS",
      methodDescription:
        "将所有腐烂的橘子作为起点同时开始BFS扩散。使用队列记录每个橘子腐烂的时间，逐层向外扩散，直到所有能腐烂的橘子都腐烂。",
      code: `function orangesRotting(grid: number[][]): number {
  const m = grid.length;
  const n = grid[0].length;
  const queue: [number, number, number][] = []; // [row, col, time]
  let freshCount = 0;
  
  // 统计新鲜橘子并将腐烂橘子加入队列
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 2) {
        queue.push([i, j, 0]);
      } else if (grid[i][j] === 1) {
        freshCount++;
      }
    }
  }
  
  if (freshCount === 0) return 0;
  
  const directions = [[0,1], [1,0], [0,-1], [-1,0]];
  let maxTime = 0;
  
  while (queue.length > 0) {
    const [row, col, time] = queue.shift()!;
    maxTime = Math.max(maxTime, time);
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow >= 0 && newRow < m && newCol >= 0 && newCol < n
          && grid[newRow][newCol] === 1) {
        grid[newRow][newCol] = 2;
        freshCount--;
        queue.push([newRow, newCol, time + 1]);
      }
    }
  }
  
  return freshCount === 0 ? maxTime : -1;
}`,
      language: "typescript",
      keyLines: [4, 10, 11, 17, 24, 30, 31, 32, 39],
      steps: [
        "遍历网格，统计新鲜橘子数量，将所有腐烂橘子加入队列",
        "如果没有新鲜橘子，直接返回0",
        "从队列取出橘子，向四个方向扩散",
        "如果相邻格子是新鲜橘子，标记为腐烂并加入队列",
        "更新最大时间",
        "检查是否还有新鲜橘子",
      ],
      advantages: [
        "多源BFS：同时从多个起点开始",
        "层序遍历：自然记录时间",
        "高效：O(m×n)时间复杂度",
      ],
      timeComplexity: { value: "O(m × n)", description: "每个格子最多访问一次" },
      spaceComplexity: { value: "O(m × n)", description: "队列最多存储所有橘子" },
      comparisons: [
        {
          name: "多源BFS",
          description: "从所有腐烂橘子同时开始扩散",
          timeComplexity: "O(m × n)",
          spaceComplexity: "O(m × n)",
          isRecommended: true,
          pros: ["最优解", "代码清晰", "易于理解"],
          cons: [],
        },
      ],
    },
  },
  // Problem 87: 课程表
  {
    id: 87,
    leetcodeNumber: 207,
    title: "课程表",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH],
    methods: [SolutionMethod.BFS, SolutionMethod.DFS],
    description: `你这个学期必须选修 numCourses 门课程，记为 0 到 numCourses - 1 。

在选修某些课程之前需要一些先修课程。先修课程按数组 prerequisites 给出，其中 prerequisites[i] = [ai, bi] ，表示如果要学习课程 ai 则 必须 先学习课程 bi 。

例如，先修课程对 [0, 1] 表示：想要学习课程 0 ，你需要先完成课程 1 。

请你判断是否可能完成所有课程的学习？如果可以，返回 true ；否则，返回 false 。`,
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation: "总共有 2 门课程。学习课程 1 之前，你需要完成课程 0 。这是可能的。",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
        explanation: "总共有 2 门课程。学习课程 1 之前，你需要先完成课程 0 ；并且学习课程 0 之前，你还应先完成课程 1 。这是不可能的。",
      },
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "0 <= ai, bi < numCourses",
      "prerequisites[i] 中的所有课程对互不相同",
    ],
    hints: [
      "⚠️ 此题目需要图可视化模版（GraphTemplate），当前暂未实现",
      "使用拓扑排序判断有向图是否有环",
      "BFS：维护入度数组，将入度为0的节点加入队列",
      "DFS：使用三色标记法检测环",
    ],
    solution: {
      methodName: "拓扑排序（BFS）",
      methodDescription:
        "使用拓扑排序判断有向图是否存在环。构建邻接表和入度数组，将入度为0的课程加入队列。每次从队列取出课程，将其后继课程的入度减1。如果后继课程入度变为0，加入队列。最后检查是否所有课程都被访问。",
      code: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const inDegree = new Array(numCourses).fill(0);
  const graph = Array.from({ length: numCourses }, () => []);
  
  // 构建邻接表和入度数组
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }
  
  // 将所有入度为0的课程加入队列
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }
  
  let count = 0;
  while (queue.length > 0) {
    const course = queue.shift()!;
    count++;
    
    // 将后继课程的入度减1
    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  
  return count === numCourses;
}`,
      language: "typescript",
      keyLines: [2, 3, 6, 7, 8, 14, 15, 22, 26, 27, 33],
      steps: [
        "构建邻接表和入度数组",
        "将所有入度为0的课程加入队列",
        "BFS：从队列取出课程",
        "将该课程的后继课程入度-1",
        "如果入度变为0，加入队列",
        "检查是否所有课程都被访问",
      ],
      advantages: [
        "拓扑排序：经典图算法",
        "BFS实现：直观易懂",
        "时间复杂度O(V+E)：最优",
      ],
      timeComplexity: { value: "O(V + E)", description: "V是课程数，E是先修关系数" },
      spaceComplexity: { value: "O(V + E)", description: "邻接表和队列空间" },
      comparisons: [
        {
          name: "BFS拓扑排序",
          description: "使用入度数组和队列",
          timeComplexity: "O(V + E)",
          spaceComplexity: "O(V + E)",
          isRecommended: true,
          pros: ["直观", "易于理解", "常用解法"],
          cons: [],
        },
        {
          name: "DFS三色标记",
          description: "使用DFS检测环",
          timeComplexity: "O(V + E)",
          spaceComplexity: "O(V)",
          isRecommended: false,
          pros: ["空间稍小"],
          cons: ["相对复杂"],
        },
      ],
    },
  },
  // Problem 88: 实现 Trie (前缀树)
  {
    id: 88,
    leetcodeNumber: 208,
    title: "实现 Trie (前缀树)",
    difficulty: Difficulty.MEDIUM,
    category: [Category.GRAPH], // Trie也属于图的一种
    methods: [SolutionMethod.DFS],
    description: `Trie（发音类似 "try"）或者说 前缀树 是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。这一数据结构有相当多的应用情景，例如自动补完和拼写检查。

请你实现 Trie 类：

- Trie() 初始化前缀树对象。
- void insert(String word) 向前缀树中插入字符串 word 。
- boolean search(String word) 如果字符串 word 在前缀树中，返回 true（即，在检索之前已经插入）；否则，返回 false 。
- boolean startsWith(String prefix) 如果之前已经插入的字符串 word 的前缀之一为 prefix ，返回 true ；否则，返回 false 。`,
    examples: [
      {
        input: `["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]`,
        output: `[null, null, true, false, true, null, true]`,
        explanation: `Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // 返回 True
trie.search("app");     // 返回 False
trie.startsWith("app"); // 返回 True
trie.insert("app");
trie.search("app");     // 返回 True`,
      },
    ],
    constraints: [
      "1 <= word.length, prefix.length <= 2000",
      "word 和 prefix 仅由小写英文字母组成",
      "insert、search 和 startsWith 调用次数总计不超过 3 * 10⁴ 次",
    ],
    hints: [
      "⚠️ 此题目需要Trie可视化模版（TrieTemplate），当前暂未实现",
      "每个节点包含26个子节点（对应a-z）",
      "节点需要标记是否为单词结尾",
      "插入和搜索都是O(m)，m为字符串长度",
    ],
    solution: {
      methodName: "Trie树实现",
      methodDescription:
        "使用树形结构，每个节点包含26个子节点数组（对应a-z）和一个布尔标记表示是否为单词结尾。插入时沿着路径创建节点，搜索时沿着路径查找节点。",
      code: `class TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  
  constructor() {
    this.children = new Map();
    this.isEnd = false;
  }
}

class Trie {
  private root: TrieNode;
  
  constructor() {
    this.root = new TrieNode();
  }
  
  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }
  
  search(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return node.isEnd;
  }
  
  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return true;
  }
}`,
      language: "typescript",
      keyLines: [2, 3, 19, 21, 22, 26, 30, 35, 40],
      steps: [
        "定义TrieNode类，包含children和isEnd",
        "insert: 沿路径创建节点，最后标记isEnd",
        "search: 沿路径查找，检查isEnd",
        "startsWith: 沿路径查找，不检查isEnd",
      ],
      advantages: [
        "高效检索：O(m)时间复杂度",
        "空间共享：公共前缀只存储一次",
        "应用广泛：自动补全、拼写检查等",
      ],
      timeComplexity: { value: "O(m)", description: "m为字符串长度" },
      spaceComplexity: { value: "O(∑m)", description: "所有字符串长度之和" },
      comparisons: [
        {
          name: "Trie树",
          description: "使用树形结构存储字符串",
          timeComplexity: "O(m)",
          spaceComplexity: "O(∑m)",
          isRecommended: true,
          pros: ["检索高效", "前缀共享", "扩展性强"],
          cons: ["空间占用较大"],
        },
      ],
    },
  },
];
