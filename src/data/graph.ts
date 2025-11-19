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
];
