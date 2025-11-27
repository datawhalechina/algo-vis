import { VisualizationStep } from "@/types";

/**
 * 解析网格输入
 * 格式："2,1,1;1,1,0;0,1,1" 表示 [[2,1,1],[1,1,0],[0,1,1]]
 */
export function parseGrid(input: string): number[][] {
  if (!input.trim()) return [];
  return input.split(';').map(row => 
    row.split(',').map(cell => {
      const num = parseInt(cell.trim());
      return isNaN(num) ? 0 : num;
    })
  );
}

/**
 * 生成腐烂的橘子算法步骤（多源BFS）
 * 时间复杂度：O(m*n)
 * 空间复杂度：O(m*n)
 */
export function generateRottenOrangesSteps(
  grid: number[][]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const m = grid.length;
  const n = grid[0]?.length || 0;

  if (m === 0 || n === 0) {
    steps.push({
      id: 0,
      description: "空网格",
      data: { grid: [] },
      variables: {},
    });
    return steps;
  }

  // 复制网格用于处理
  const workGrid = grid.map(row => [...row]);
  const queue: [number, number, number][] = []; // [row, col, time]
  let freshCount = 0;

  // 统计新鲜橘子并将腐烂橘子加入队列
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (workGrid[i][j] === 2) {
        queue.push([i, j, 0]);
      } else if (workGrid[i][j] === 1) {
        freshCount++;
      }
    }
  }

  steps.push({
    id: steps.length,
    description: `初始状态：${queue.length} 个腐烂的橘子，${freshCount} 个新鲜橘子`,
    data: { grid: workGrid.map(row => [...row]) },
    variables: {
      rottenCount: queue.length,
      freshCount,
      time: 0,
      gridState: workGrid.map(row => row.map(cell => ({
        value: cell,
        isCurrent: false,
        isRotten: cell === 2,
        isFresh: cell === 1,
      }))),
    },
  });

  if (freshCount === 0) {
    steps.push({
      id: steps.length,
      description: "没有新鲜橘子，返回 0",
      data: { grid: workGrid.map(row => [...row]) },
      variables: {
        result: 0,
        completed: true,
      },
    });
    return steps;
  }

  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let maxTime = 0;
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [row, col, time] = queue.shift()!;
    const key = `${row},${col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);

    maxTime = Math.max(maxTime, time);

    if (time > 0) {
      steps.push({
        id: steps.length,
        description: `时间 ${time}: 橘子 (${row}, ${col}) 腐烂`,
        data: { grid: workGrid.map(row => [...row]) },
        variables: {
          currentRow: row,
          currentCol: col,
          time,
          freshCount,
          gridState: workGrid.map((r, i) => r.map((cell, j) => ({
            value: cell,
            isCurrent: i === row && j === col,
            isRotten: cell === 2,
            isFresh: cell === 1,
          }))),
        },
      });
    }

    // 向四个方向扩散
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < m &&
        newCol >= 0 &&
        newCol < n &&
        workGrid[newRow][newCol] === 1
      ) {
        workGrid[newRow][newCol] = 2;
        freshCount--;
        queue.push([newRow, newCol, time + 1]);

        steps.push({
          id: steps.length,
          description: `时间 ${time + 1}: 橘子 (${newRow}, ${newCol}) 将会腐烂`,
          data: { grid: workGrid.map(row => [...row]) },
          variables: {
            currentRow: newRow,
            currentCol: newCol,
            time: time + 1,
            freshCount,
            spreading: true,
            gridState: workGrid.map((r, i) => r.map((cell, j) => ({
              value: cell,
              isCurrent: i === newRow && j === newCol,
              isRotten: cell === 2,
              isFresh: cell === 1,
              isSpreading: i === newRow && j === newCol,
            }))),
          },
        });
      }
    }
  }

  const result = freshCount === 0 ? maxTime : -1;

  steps.push({
    id: steps.length,
    description: freshCount === 0 
      ? `完成！所有橘子在 ${maxTime} 分钟后腐烂`
      : `失败！还有 ${freshCount} 个橘子无法腐烂`,
    data: { grid: workGrid.map(row => [...row]) },
    variables: {
      result,
      time: maxTime,
      freshCount,
      completed: true,
      success: freshCount === 0,
      gridState: workGrid.map(row => row.map(cell => ({
        value: cell,
        isRotten: cell === 2,
        isFresh: cell === 1,
      }))),
    },
  });

  return steps;
}
