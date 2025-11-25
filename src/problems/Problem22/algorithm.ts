import { VisualizationStep } from "@/types";

// 解析输入字符串为二维数组
export function parseGrid(input: string): number[][] {
  if (!input.trim()) return [];

  // 支持多种输入格式
  // 格式1: "11000,11000,00100,00011" (逗号分隔的行)
  // 格式2: "1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1" (换行分隔)

  const lines = input.includes("\n")
    ? input.split("\n").map((line) => line.trim())
    : input.split(",").map((line) => line.trim());

  return lines.map((line) => {
    const hasSeparators = /[\s,]/.test(line);

    if (!hasSeparators && line.length > 1) {
      return line.split("").map((char) => {
        if (char === "1") return 1;
        if (char === "0") return 0;
        return parseInt(char) || 0;
      });
    }

    return line.split(/[\s,]+/).map((char) => {
      if (char === "1") return 1;
      if (char === "0") return 0;
      return parseInt(char) || 0;
    });
  });
}

// DFS遍历岛屿
export function generateNumberOfIslandsSteps(
  grid: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  let islandCount = 0;

  if (grid.length === 0 || grid[0].length === 0) {
    steps.push({
      id: stepId++,
      description: "网格为空，岛屿数量为 0",
      data: { grid, visited: [], currentIsland: null },
      variables: { islandCount: 0 },
    });
    return steps;
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));
  const currentIsland: number[][] = [];

  // DFS辅助函数
  function dfs(row: number, col: number, islandId: number) {
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      visited[row][col] ||
      grid[row][col] === 0
    ) {
      return;
    }

    visited[row][col] = true;
    currentIsland.push([row, col]);

    steps.push({
      id: stepId++,
      description: `发现岛屿 ${islandId} 的一部分：位置 [${row}, ${col}]`,
      data: {
        grid,
        visited: visited.map((r) => [...r]),
        currentIsland: currentIsland.map((c) => [...c]),
        islandId,
      },
      variables: {
        row,
        col,
        islandId,
        islandCount,
      },
      highlightedNodes: [`${row},${col}`],
    });

    // 四个方向DFS
    const directions = [
      [-1, 0], // 上
      [1, 0], // 下
      [0, -1], // 左
      [0, 1], // 右
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] === 1
      ) {
        dfs(newRow, newCol, islandId);
      }
    }
  }

  // 遍历整个网格
  steps.push({
    id: stepId++,
    description: "开始遍历网格，寻找岛屿",
    data: { grid, visited: visited.map((r) => [...r]), currentIsland: [] },
    variables: { islandCount: 0 },
  });

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 1 && !visited[i][j]) {
        islandCount++;
        currentIsland.length = 0; // 清空当前岛屿

        steps.push({
          id: stepId++,
          description: `发现新岛屿 ${islandCount}，开始DFS遍历`,
          data: {
            grid,
            visited: visited.map((r) => [...r]),
            currentIsland: [],
            islandId: islandCount,
          },
          variables: {
            row: i,
            col: j,
            islandId: islandCount,
            islandCount,
          },
          highlightedNodes: [`${i},${j}`],
        });

        dfs(i, j, islandCount);

        steps.push({
          id: stepId++,
          description: `完成岛屿 ${islandCount} 的遍历，当前共发现 ${islandCount} 个岛屿`,
          data: {
            grid,
            visited: visited.map((r) => [...r]),
            currentIsland: currentIsland.map((c) => [...c]),
            islandId: islandCount,
          },
          variables: {
            islandCount,
          },
        });
      }
    }
  }

  steps.push({
    id: stepId++,
    description: `遍历完成，共发现 ${islandCount} 个岛屿`,
    data: {
      grid,
      visited: visited.map((r) => [...r]),
      currentIsland: [],
    },
    variables: { islandCount },
  });

  return steps;
}
